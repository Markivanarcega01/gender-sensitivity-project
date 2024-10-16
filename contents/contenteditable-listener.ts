import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState, type SyntheticEvent } from "react"
import delegate from "delegate-it"
import rangy from "rangy"

export const config: PlasmoCSConfig = {
  //matches: ["<all_urls>"],
  matches: ["https://mail.google.com/mail/*","https://workspace.upou.edu.ph/*","https://docs.google.com/document/*"],
  //css: ["font.css"]
}

document.addEventListener("input", (event) => {
  if(event.target instanceof HTMLElement && event.target.contentEditable === "true"){
    const target = event.target as HTMLElement
    let cursorPosition = saveCursorPosition(target)
    resetContent(target)
    checkGenderAndHighlight(target)
    highlightedWordListener(target)
    restoreCursorPosition(target, cursorPosition)
    target.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        setCaretAfterNewline(target, cursorPosition)
      }
    })
    //setCaretAfterNewline(target, cursorPosition)
  }
})

const dictionary1 = {
  'anchorman': ['anchor', 'anchorperson'],
  'actress': ['actor'],
  'authoress': ['author'],
  'aviatrix': ['aviator'],
  'bellboy': ['bellhop'],
  'bellman': ['bellhop'],
  'busboys': ['waiters assistants'],
  'cameraman': ['camera operators', 'cinematographers', 'photographers'],
  'career girls': ['career women'],
  'chairman': ['chairperson'],
  'chambermaids': ['hotel workers'],
  'chick': ['woman'],
  'chorus girls': ['chorus dancers'],
  'clergyman': ['minister', 'rabbi', 'priest', 'pastor'],
  'comedienne': ['comedian'],
  'congressman': ['representative', 'member of congress', 'congress member', 'legislator'],
  'cowboys': ['ranch hands'],
  'cowgirls': ['ranch hands'],
  'craftsmen': ['artisans', 'craft artists', 'craftspersons'],
  'delivery boys': ['deliverers'],
  'draftsmen': ['drafters'],
  'dykes': ['lesbians'],
  'executrixes': ['executors'],
  'fathers': ['priests'],
  'female lawyer': ['lawyer'],
  'firemen': ['fire fighters'],
  'fishermen': ['fishers', 'fisherfolk'],
  'foremen': ['supervisors'],
  'forefather': ['ancestor'],
  'founding fathers': ['founders'],
  'girl': ['adult female'],
  'girl athlete': ['athlete'],
  'heroic women': ['heroes'],
  'heroines': ['heroes'],
  'hookers': ['prostitutes'],
  'hostesses': ['hosts'],
  'headmasters': ['principals'],
  'headmistresses': ['principals'],
  'ladies': ['women'],
  'lady doctor': ['doctor'],
  'laundrywomen': ['launderers'],
  'layman': ['layperson', 'nonspecialist', 'non-professional'],
  'lineman': ['line installer', 'line repairer'],
  'longshoremen': ['stevedores'],
  'lumbermen': ['lumbercutters'],
  'maids': ['domestic helpers', 'household workers'],
  'mailman': ['mail carrier'],
  'male nurse': ['nurse'],
  'male secretary': ['secretary'],
  'man': ['human being', 'human', 'person', 'individual'],
  //'man on the street': ['average person', 'ordinary person'],
  'man-made': ['manufactured', 'synthetic', 'artificial'],
  'mankind': ['human beings', 'humans', 'humankind', 'humanity'],
  'manning': ['staffing', 'working', 'running'],
  'manhood': ['adulthood', 'maturity'],
  'manpower': ['human resources', 'staff', 'personel', 'labor force'],
  'masterful': ['domineering', 'very skillful'],
  'motherhood': ['parenthood'],
  'fatherhood': ['parenthood'],
  'old masters': ['classic artists'],
  //'one man show': ['one person show', 'solo exhibition'],
  'policeman': ['police officer', 'law enforcement officer'],
  'poetess': ['poet'],
  'postman': ['letter carrier'],
  'pressmen': ['press operators'],
  'proprietress': ['proprietor'],
  'repairmen': ['repairers'],
  'salesman': ['salesperson', 'sales representative', 'sales agent'],
  'salesgirls': ['saleswomen'],
  'servants': ['household help'],
  'spokesman': ['spokesperson', 'representative'],
  'sportsmen': ['sports enthusiasts'],
  'starlets': ['aspiring actors'],
  'statesmen': ['diplomats', 'political leaders'],
  'statemanship': ['diplomacy'],
  'stewardess': ['flight attendant'],
  'suffragette': ['suffragist'],
  //'to a man': ['everyone', 'unanimously', 'without exception'],
  'usherette': ['usher'],
  'washerwomen': ['launderers'],
  'watchmen': ['guards'],
  'weatherman': ['weather reporter', 'weathercaster', 'meteorologist'],
  'whores': ['prostitutes'],
  'woman writer': ['writer'],
  'working mothers': ['wage-earning mothers'],
  'workmen': ['workers', 'wage earners'],
}

function createModal(suggestedWords, wordElement) {
  // Create modal container
  const rect = wordElement.getBoundingClientRect();
  const modal = document.createElement('div');
  modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
      background-color: #f5f6f7;
      padding: 10px;
      border-radius: 5px;
      width: auto;
      position: absolute;
      top:${rect.top + window.scrollY + 30}px;
      left:${rect.left + window.scrollX}px;
  `;

  // Add suggested words list
  const wordList = document.createElement('ul');
  wordList.style.cssText=`
      list-style-type : none;
      margin: 0;
      padding: 0;
  `
  suggestedWords.forEach(word => {
      const listItem = document.createElement('li');
      listItem.style.cssText=`
          margin-right: 20px;
          width: auto;
          display: table;
          padding : 2px;
      `
      listItem.textContent = word;
      listItem.style.cursor = 'pointer';
      listItem.addEventListener('click', (event) => {
          // Return the selected word and close the modal
          modal.dataset.selectedWord = word;
          document.body.removeChild(modal);
      });
      wordList.appendChild(listItem);
  });
  modalContent.appendChild(wordList);

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.style.cssText=`
       border-radius: 50%;
       position: absolute;
       top: 9px;
       right: 5px;
  `
  closeButton.textContent = 'X';
  closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
  });
  modalContent.appendChild(closeButton);

  modal.appendChild(modalContent);
  return modal;
}

function modal(suggestedWords, wordElement) {  
  const modalElement = createModal(suggestedWords,wordElement);
  document.body.appendChild(modalElement);

  return new Promise((resolve) => {
      //Setup an interval to check if a word has been selected
      const checkForSelection = setInterval(() => {
          if (modalElement.dataset.selectedWord) {
              //If a word is selected, clear the interval and resolve the Promise with the selected word
              clearInterval(checkForSelection);
              resolve(modalElement.dataset.selectedWord);
          }
      }, 100);

      modalElement.addEventListener('click', (event) => {
          if (event.target === modalElement) {
              document.body.removeChild(modalElement);
              clearInterval(checkForSelection);
              resolve(null);
          }
      });
  });
}

function highlightedWordListener(text) {
  let words = document.getElementsByClassName("highlight-word");

  let suggestedWords = ['Word1', 'Word2', 'Word3', 'Word4'];
  console.log(words)
  if (words.length > 0) {
      for (let i = 0; i < words.length; i++) {
          /**
              * Once magkaroon na ng AI, we can refactor this into mouseover/mouseout event
              * For now, naka click muna siya since naka list/hardcoded pa ang suggested word
              * 
              * Reason: If AI na ang gamit hindi na problem ang indexes since neural network na ang gamit
              *           Kaya naka IIFE(Immediately Invoke Function Expression) kasi DOM is realtime so kada remove sa classList
              *               is nababago yung indexes ng bawat words which change the matching of index and suggested word
           */
          (function (wordElement: any) { // Capture the specific word element
              let suggestedWordsForWord = dictionary1[wordElement.innerText];
              
              wordElement.addEventListener('click', async function modalPopUp(event) {
                  const selectedWord = await modal(suggestedWordsForWord ? suggestedWordsForWord : suggestedWords, wordElement);
                  if (selectedWord && typeof wordElement.innerText !== 'undefined') {
                      wordElement.outerHTML = selectedWord;
                      traverseAndSetCursorToEnd(text); // Traverse and set cursor to the end
                  } else {
                      console.log('error');
                      traverseAndSetCursorToEnd(text);
                  }
              });
          })(words[i]); // Immediately invoke function with the word element
      }
      
  } else {
      console.log('array is empty');
  }
}

function traverseAndSetCursorToEnd(contentEditableDiv) {
  // Focus on the contenteditable div
  contentEditableDiv.focus();

  // Create a range
  const range = document.createRange();
  const selection = window.getSelection();

  // Set the range to the end of the contenteditable div
  range.selectNodeContents(contentEditableDiv);
  range.collapse(false); // false collapses the range to the end

  // Remove any selections and add the new range
  selection.removeAllRanges();
  selection.addRange(range);
}

function resetContent(text){
  const regex = new RegExp('<span class="highlight-word">|<\/span>', 'g');
  const regex2 = new RegExp('<div dir="ltr">|<\/div>', 'g');
  if(regex2.test(text.innerHTML)){
    text.innerHTML = text.innerHTML.replace(regex2, '')
    console.log('div ltr exist')
  }
  return text.innerHTML = text.innerHTML.replace(regex, '')
}

function checkGenderAndHighlight(text) {
  let textWithHTML = text.innerHTML

  // Bawal ang 2 or more words as dictionary keys ex: man (and) one man show
  Object.keys(dictionary1).forEach(word =>{

      const regex = new RegExp(`\\b${word}\\b`,'gi')    
      textWithHTML = textWithHTML.replace(regex, `<span class='highlight-word'>${word}<\/span>`)
      
  })

  text.innerHTML = textWithHTML
  console.log({asd:textWithHTML})
  return text;
}


function saveCursorPosition(element) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  let preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  let cursorPosition = preCaretRange.toString().length;
  return cursorPosition;
}

// // Function to restore the cursor position after modifying content
function restoreCursorPosition(element, cursorPosition) {
  let selection = window.getSelection();
  let range = document.createRange();

  // Traverse the element's text nodes to find the right position to place the cursor
  let node = element;
  let chars = cursorPosition;
  function traverseNodes(node) {
      if (node.nodeType === 3) { // Text node
          if (node.length >= chars) {
              range.setStart(node, chars);
              range.setEnd(node, chars);
              return true;
          } else {
              chars -= node.length;
          }
      } else {
          for (let i = 0; i < node.childNodes.length; i++) {
              if (traverseNodes(node.childNodes[i])) {
                  return true;
              }
          }
      }
      return false;
  }

  traverseNodes(node);

  selection.removeAllRanges();
  selection.addRange(range);
}

function setCaretAfterNewline(element, cursorPosition) {
  //let cursorPosition = saveCursorPosition(element);
  let selection = window.getSelection();
  let range = document.createRange();
  
  // Find the last div in the element
  let lastDiv = null;
  for (let i = element.childNodes.length - 1; i >= 0; i--) {
      if (element.childNodes[i].nodeName === 'DIV') {
          //console.log(element.childNodes[i])
          lastDiv = element.childNodes[i];
          break;
      }
  }
  if (lastDiv) {
      // If the last div is empty or contains only a <br>, set caret inside it
      if (lastDiv.childNodes.length === 0 || (lastDiv.childNodes.length === 1 && lastDiv.firstChild.nodeName === 'BR')) {
          range.setStart(lastDiv, 0);
          range.setEnd(lastDiv, 0);
          //console.log('div with br')
      } else{
          // If the last div has content, set caret after it
          restoreCursorPosition(element, cursorPosition)

          return
      }
  } else {
      // If no div found, set caret at the end of the element
      restoreCursorPosition(element, cursorPosition)

      return
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

let style = document.createElement('style');
style.innerHTML = `
    .highlight-word {
        text-decoration: underline;
        text-decoration-color: blue;
        cursor: text;
    }
`;
document.head.appendChild(style);