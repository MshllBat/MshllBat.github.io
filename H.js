

const choicesArray = [];
const ChoiceObj = new Choice;
const input= document.getElementById('input');
const choicesCounter = document.getElementById('counter');
const choiseDiv = document.querySelector('.choices');
const errorDiv = document.querySelector('.error');
const addBtn = document.getElementById('addBtn');
const reloadBtn = document.getElementById('reloadBtn');
const chooseBtn = document.getElementById('chooseBtn');

//defined at mouseover
let currentElement;
let numOfChoices = 0;

//flag
//if false: means we haven't added new choices yet.
//if true: 1-we are adding new choices, so clear DB, and disable reoladBtn.
//          or
//         2-we reloaded previous choices.
let addedChoice = false;

input.onfocus = function(){
  this.style.borderColor = '#206e6c';
  errorDiv.innerText = '';
}

//need to check, because array is empty, then choiceElement is null




document.addEventListener('click', (e) => {
  let {target} = e;
  if(target === addBtn){
    if(!addedChoice){
      cancelReload();
      addedChoice = true;
    }
    addChoise();
  }else if(target === reloadBtn){
    reloadBtn.disabled = true;
    reloadChoices();

  }else if(target === chooseBtn ){
    if(numOfChoices > 0){
      pickRandomElement();
      chooseBtn.disabled = true;
      //undisable after function stops
      setTimeout(() => {
        chooseBtn.disabled = false;
      },9000);
    }else{
      alert('MUST ADD CHOICES FIRST!')
    }
  }else if(target.classList.contains('delete')){
    deleteChoice(target);
  }
});


// document.addEventListener('mouseover', (e) => {
//   let {target} = e;
//   if(target.classList.contains('choice')){
//     // currentElement = target;
//     let img = target.querySelector('img');
//     img.style.display = 'block';
//   }
// });


// async function deleteChoice(target){
//   let ID = parseInt(target.dataset.id);
//   console.log(ID);
//   let deleteRequest = await ChoiceObj.delete(ID);
//   deleteRequest.onsuccess = () => {
//     let choice = document.getElementById(ID);
//     let obj = {text:choice.innerText, id:ID}
//     console.log(obj);
//     console.log(choicesArray.indexOf(obj));
//     choice.remove();
//   }
//   deleteRequest.onerror = () => {
//     console.log("eRRROR");
//   }
// }



function getInputValue(){
  //get value
  //if empty change border to red, add error message

  inputValue = input.value;
  if(inputValue === ''){
    input.style.borderColor = 'red';
    errorDiv.innerText = "*cannot add an empty choice!";
    return null;
  }else{
    return inputValue;
  }
}

async function addChoise(){

  let choice = getInputValue();
  if(choice !== null){

    //increament numOfChoices because we are adding a new one right now
    numOfChoices++;

    let addRequest = await ChoiceObj.add({text:choice, id:numOfChoices});
    addRequest.onsuccess = () => {

      if (numOfChoices === 9){
        addBtn.disabled = true;
        input.disabled = true;
        input.value = 'REACHED MAX CHOICES!'
        input.style.color = 'red';
      }else{
        //clear input field
        input.value = '';
      }

      //refresh choices
      getChoices(numOfChoices);
    }
  }else{
    console.log('value is null');
    return false;
  }
}




async function getChoices(choiceID){


  let request = await ChoiceObj.get(choiceID);

  request.onsuccess = () => {

    let choice = request.result;

    choicesArray.push(choice);
    console.log(choice);
    displayChoices();
  }
}

async function reloadChoices(){

  let request = await ChoiceObj.all();
  request.onsuccess = () => {

    let cursor = request.result;

    if(cursor){
      //explianed strat of file
      addedChoice = true;
      let choice = cursor.value;
      choice.id = (++numOfChoices);
      choicesArray.push(choice);
      cursor.continue();
    }else{
      //0 means no previous choices are stored
      if(numOfChoices === 0){
        alert("NO Previous Choices Found");
      }

      displayChoices();

      if(numOfChoices === 9){
        addBtn.disabled = true;
        input.disabled = true;
        input.value = 'REACHED MAX CHOICES!'
        input.style.color = 'red';
      }
    }
  }
}

function displayChoices(){

  //loop won't be needed when we add new choice,
  //but we need it when we reload stored choices

  const ULELEMENT = document.createElement('ul');

  for(let choice of choicesArray){

    const LIELEMENT = document.createElement('li');
    LIELEMENT.className = 'choice';
    //choise will be object
    LIELEMENT.id  = choice.id;
    LIELEMENT.onmouseleave = removeDeleteIcon(LIELEMENT);

    // img, add dataset id, make img display none until mouseover
    LIELEMENT.innerHTML = `
    ${choice.text}
    <!-- <img src='delete-icon.png' class='delete' data-id=${choice.id} > -->
    `
    ULELEMENT.append(LIELEMENT);
  }
  choiseDiv.innerHTML = '';
  choiseDiv.append(ULELEMENT);
  increamentCounter();
}

function increamentCounter(){
  //increament on page
  if(choicesArray.length > 0){
    choicesCounter.style.display = 'inline-block';
    choicesCounter.innerText = choicesArray.length;
  }else{
    return false;
  }
}

function removeDeleteIcon(target){
  // if(target !== null){
  //   target.querySelector('img').style.display = 'none';
  // }
}
function pickRandomElement(){
  let changedElement;
  //we want to change element each 200ms
  let int = setInterval(() => {
    //get random index
    let index = generateRandomNumber();
    let choice = choicesArray[index];
    console.log(choice.id);
    //choice is picked randomly
    changedElement = document.getElementById(choice.id);
    changedElement.style.color = 'black';
    changedElement.style.background = 'white';

    //after 150ms revert style to original
    setTimeout(() => {
      changedElement.style.color = 'white';
      changedElement.style.background = 'linear-gradient(0deg, rgba(71,81,82,1) 0%, rgba(0,0,0,1) 100%)';
    },150);
    //end interval
  },200)

  //end function after 3s
  setTimeout(()=>{
    clearInterval(int);
    changedElement.style.zIndex = '100';
    changedElement.style.transform = 'scale(3,3)';

    //after 4s put element back.
    setTimeout(()=>{
      changedElement.style.transform = 'scale(1)';
    },4000);
      console.log(changedElement);
  },3000);


}

function generateRandomNumber(){
  //we want a number between 0 and lengthofArray ie numOfChoices
  //with this number we will chnage affect of the picked choice from array
  return Math.floor(Math.random() * numOfChoices);
}

async function clearChoices(){
  let clearRequest = await ChoiceObj.clear();
  clearRequest.onsuccess = () => {
    displayChoices();
  }
}

async function cancelReload(){
  //when user adds first choice:
  //1-disable reload button
  //2-clear db so only new choices are present
  document.getElementById('reloadBtn').disabled = true;
  let request = await ChoiceObj.clear();
}
