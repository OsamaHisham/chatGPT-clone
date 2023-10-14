// ========== Importing resources ==========
import bot from './assets/bot.svg';
import user from './assets/user.svg';

// ========== elements ==========
const form = document.querySelector('form'); 
const chatContainer = document.querySelector('#chat_container');

//  ========== variables ==========
let loadInterval;

// ========== Function to load the messages for us ==========
function loader(element){

  // Inintial loading display
  element.textContent = 'Thinking.';

  // changes to the loading display every 350ms
  loadInterval = setInterval(() => {

    element.textContent += '.';

    if (element.textContent === 'Thinking....'){
      element.textContent = 'Thinking';
    }
  }, 350)
}

// ========== Function to type answer letter by letter ==========
function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    
    if (index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }
    else{
      clearInterval(interval);
    }
  }, 20)
}

// ========== Function to generate a unique ID for each massage ==========
// By using (time, date) to map over them later
function generateUniqueID(){

  // For current Date
  const timeStamp = Date.now();

  // To make it more random
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  // The return ID
  return `id-${timeStamp}-${hexadecimalString}`;
}

// ========== Fnction to change the color of the messages from our side and the AI's side ==========
function chatStripe(isAi, value, uniqueId) {
    return (
    `
    <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
            <div class="profile">
                <img 
                  src=${isAi ? bot : user} 
                  alt="${isAi ? 'bot' : 'user'}" 
                />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
    </div>
    `
    )
}

// ========== Function to handle and trigger the AI Responces ==========
const handleSubmit = async (e) => {
  // Prevent Default Form action (Reload the page)
  e.preventDefault();

  // Get the data we typed in the form
  const data = new FormData(form);

  // Generate the user's chatstripe (chatStripe) function
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // Clear the text area input
  form.reset();

  // Bot chatstripe (chatStripe) function
  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

  // Scrolling down when the user is typing
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Getting the div for the message 
  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  // Fetching the data from server side ~ bot response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // Data with the message that is coming from the textarea element on screen
      prompt: data.get('prompt')
    })
  })

  // Clearing the interval after the response is received
  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if(response.ok){
    // Response from the backend server
    const data = await response.json();
    // Parsing the backend response
    const parsedData = data.bot.content;

    // Pasing parsed data to the frontend
    typeText(messageDiv, parsedData);
  }
  // If there is an error
  else {
    // Fetching the error message
    const error = await response.text();
    // Displaying error in Frontend
    messageDiv.innerHTML = "There is an error :( Please try again"
    // Giving an alert
    alert(error);
  }
}

// ========== Calling the handleSubmit function to see the changes ==========
// Button
form.addEventListener("submit", handleSubmit); 
// Enter Key
form.addEventListener("keyup", (e)=>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
});


