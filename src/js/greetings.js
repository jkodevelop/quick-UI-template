function sayHi(user, prompt) {
  if(prompt === true){
    alert(`Hello, ${user}!`);
  }else{
    console.log(`Hello, ${user}!`);
  }
}

function sayBye(user, prompt) {
  if(prompt === true){
    alert(`Bye, ${user}!`);
  }else{
    console.log(`Bye, ${user}!`);
  }
}

export {sayHi, sayBye};