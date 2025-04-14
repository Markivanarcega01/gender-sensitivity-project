import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { checkGenderAndHighlight, highlightedWordListener, resetContent, setCaretAfterNewline } from "~components/contenteditable-div-functions";
import { dictionary, ignoredWords } from "~components/dictionary";

export const config: PlasmoCSConfig = {
    matches: ["https://workspace.upou.edu.ph/contentbank/edit.php*"],
    run_at: "document_end",
}
function getDocumentOffset(node: Node, offset: number, iframeDoc: Document): number {
    let totalOffset = 0;
    const walker = iframeDoc.createTreeWalker(
        iframeDoc.body,
        NodeFilter.SHOW_TEXT,
        null
    );

    let currentNode = walker.nextNode();
    while (currentNode && currentNode !== node) {
        totalOffset += currentNode.textContent.length;
        currentNode = walker.nextNode();
    }

    return totalOffset + offset;
}

// Function to find node and offset from absolute position within iframe
function findNodeAndOffset(container: Node, absoluteOffset: number, iframeDoc: Document): { node: Node, offset: number } {
    let currentOffset = 0;
    const walker = iframeDoc.createTreeWalker(
        iframeDoc.body,
        NodeFilter.SHOW_TEXT,
        null
    );

    let node = walker.nextNode();
    while (node) {
        const length = node.textContent.length;
        if (currentOffset + length >= absoluteOffset) {
            return {
                node: node,
                offset: absoluteOffset - currentOffset
            };
        }
        currentOffset += length;
        node = walker.nextNode();
    }

    // If we couldn't find the exact position, return the last possible position
    const lastNode = container.lastChild;
    return {
        node: lastNode,
        offset: lastNode?.textContent?.length || 0
    };
}

// Function to save cursor position within iframe
function saveCursorPosition(iframeDoc: Document): {
    absoluteStart: number,
    absoluteEnd: number
} | null {
    const selection = iframeDoc.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    
    return {
        absoluteStart: getDocumentOffset(range.startContainer, range.startOffset, iframeDoc),
        absoluteEnd: getDocumentOffset(range.endContainer, range.endOffset, iframeDoc)
    };
}

// Function to restore cursor position within iframe
function restoreCursorPosition(iframeDoc: Document, savedPosition: {
    absoluteStart: number,
    absoluteEnd: number
}): void {
    if (!savedPosition) return;

    try {
        const selection = iframeDoc.getSelection();
        const range = iframeDoc.createRange();

        const startPos = findNodeAndOffset(iframeDoc.body, savedPosition.absoluteStart, iframeDoc);
        const endPos = findNodeAndOffset(iframeDoc.body, savedPosition.absoluteEnd, iframeDoc);

        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);

        selection.removeAllRanges();
        selection.addRange(range);
    } catch (error) {
        console.error('Failed to restore cursor position:', error);
    }
}

const h5pEditorInputListener = () => {

    const [op,setOp] = useState(0)
    
    //const [isDocumentLoaded,setIsDocumentLoaded] = useState(true)
    const [display, setDisplay] = useState('')
    const [genderWord,setGenderWord] = useState([''])
    let arrLength = 0
    let activation  = true;

    useEffect(() => {
        setDisplay(`To Activate Gender Bias Detection, Click here`)
        setOp(1)
        //Debounce for 5 seconds
        let timeout = setTimeout(() => {
            setOp(0)
        },5000)
        window.addEventListener('focus', (event) => {
            //ignoredWords.length = 0
            console.log('loaded')
            if(activation){
                clearTimeout(timeout)
                setDisplay('Gender Detection Activated')
                    setOp(1)
                    setTimeout(() => {
                        setOp(0)
                }, 3000)
                activation = false
            }
            try {
                //traverseIframes(document)
                //const iframe = document.getElementsByClassName('h5p-editor-iframe')[0] as HTMLIFrameElement || null
                const iframe = document.querySelector('iframe')
                const iframeDoc = iframe.contentDocument
            //     let style = iframeDoc.createElement('style');
            //         style.innerHTML = `
            //             .highlight-word {
            //                 text-decoration: underline;
            //                 text-decoration-color: blue;
            //                 cursor: text;
            //     }
            //    `;
            //     iframeDoc.head.appendChild(style)
            //     console.log(iframeDoc)
                if(iframeDoc){
                    iframeDoc.addEventListener('click', (event:any) => {
                        //console.log('clicked')
                        const inputFields = iframeDoc.querySelectorAll('input,textarea')
                        //console.log(inputFields)
                        inputFields.forEach((inputField) => {
                            if(inputField.hasAttribute('listener')) return
                                inputField.setAttribute('listener','true')
                                inputField.addEventListener('input', (event:any) => {
                                const target = event.target as HTMLInputElement
                                let genderBias = []
                                Object.keys(dictionary).forEach(word => {
                                    const regex = new RegExp(`\\b${word}\\b`, 'gi')
                                    if(regex.test(target.value) && !genderBias.includes(word)){
                                        genderBias.push(word)
                                       
                                    }
                                })

                                if(arrLength !== genderBias.length){
                                    //setGenderWord(genderBias)
                                    setDisplay(`Gender-bias: ${genderBias.join(', ')}`)
                                    setOp(1)
                                    // setTimeout(() => {
                                    //     setOp(0)
                                    // }, 3000)
                                }
                                if(genderBias.length === 0){
                                    setOp(0)
                                }

                                arrLength = genderBias.length
                                //console.log(event.target.value)
                            })
                        })

                        // New structure of H5P
                        const editableDiv = iframeDoc.querySelector('.ck-editor__editable')
                        //console.log(editableDiv)

                        //console.log(editableDiv.innerHTML)
                        editableDiv.addEventListener('keyup', (event:any) => {
                            const target = event.target as HTMLElement
                            let genderBias = []
                            Object.keys(dictionary).forEach(word =>{
                                const regex = new RegExp(`\\b${word}\\b`, 'gi')
                                    if(regex.test(target.innerHTML) && !genderBias.includes(word)){
                                        genderBias.push(word)
                                       
                                    }
                            })
                            if(arrLength !== genderBias.length){
                                //setGenderWord(genderBias)
                                setDisplay(`Gender-bias: ${genderBias.join(', ')}`)
                                setOp(1)
                                // setTimeout(() => {
                                //     setOp(0)
                                // }, 3000)
                            }
                            if(genderBias.length === 0){
                                setOp(0)
                            }

                            arrLength = genderBias.length
                            
                        })
                    })
                }
            } catch (error) {
                console.log('Error')
                // setDisplay('Document not found: Reloading in 5 secs')
                // setOp(1)
                // setTimeout(() => {
                //     setOp(0)
                //     window.location.reload()
                // },5000)
            }    
        })
        
    },[])
        

    return(
        <div style={{
            backgroundColor: '#0160C9',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            opacity: op,
            transition: 'opacity 0.3s ease-in-out',
            position: 'fixed',
            right: '20px',
            bottom: '20px',
          }} id="toastMessage">
            {display}
            {/* {isDocumentLoaded ? `Gender-bias: ${genderWord.join(', ')}` : 'Document not found: Reloading in 5 secs'}     */}
          </div>
    )
}

export default h5pEditorInputListener