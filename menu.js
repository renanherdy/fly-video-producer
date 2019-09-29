const readline = require('readline-sync');

module.exports = function menu() {
  const input = {};
  input.question1 = readline.question(`digite um input `);


  console.log('input');
  console.log(input);
}