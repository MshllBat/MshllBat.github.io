

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
let addedChoices = 0;

input.onfocus = function(){
  this.style.borderColor = '#206e6c';
  errorDiv.innerText = '';
}


document.addEventListener('click', (e) => {
  let {target} = e;
  if(target === addBtn){
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
      },12700);
    }else{
      alert('MUST ADD CHOICES FIRST!')
    }
  }
});

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

    //flag, explained at decleration
    if(addedChoices === 0){
      cancelReload();
      addedChoices = 1;
    }

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
    displayChoices();
  }
}

async function reloadChoices(){

  let request = await ChoiceObj.all();
  request.onsuccess = () => {

    let cursor = request.result;

    if(cursor){
      let choice = cursor.value;
      numOfChoices++;
      choicesArray.push(choice);
      cursor.continue();
    }else{
      //0 means no previous choices are stored
      if(numOfChoices === 0){
        alert("NO Previous Choices Found");
        return false;
      }
      else{
        //only change flag if there is choices in DB
        // flag, explained at decleration
        if(addedChoices === 0){
          addedChoices = 1;
        }
      }
      console.log("HELOO");

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
    LIELEMENT.id  = 'choice'+choice.id;
    LIELEMENT.innerHTML = `${choice.text}`
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

function pickRandomElement(){
  let changedElement;
  //we want to change element each 200ms
  let int = setInterval(() => {
    //get random index
    let index = generateRandomNumber();
    let choice = choicesArray[index];
    //choice is picked randomly
    changedElement = document.getElementById('choice'+choice.id);
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
  },5000);


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
  reloadBtn.disabled = true;
  let request = await ChoiceObj.clear();
}
