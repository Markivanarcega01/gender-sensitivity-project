import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState, type HtmlHTMLAttributes } from "react"
import { dictionary } from "~components/dictionary"
export const config: PlasmoCSConfig = {
  matches: ["https://workspace.upou.edu.ph/contentbank/view.php*"],
  run_at: "document_start",
}
/**
 * window.load to find the h5p main wrap
 * Then add an click listener to it
 * The click will find all the textarea and inputs in the current webpage
 * Then enable the gender-bias response
 */


//For student side
const h5pListenerToaster = () => {
    const [op,setOp] = useState(0)
    const [display, setDisplay] = useState('')
    
    const [genderWord,setGenderWord] = useState([''])
    let arrLength = 0

    useEffect(() => {
        window.addEventListener('load', (event) => {
            try {
                //throw new Error('asd')
                const iframe = document.getElementsByClassName('h5p-player w-100 border-0')[0] as HTMLIFrameElement
                const iframeDoc =  iframe.contentDocument
                const iframe2 = iframeDoc.getElementsByClassName('h5p-iframe h5p-initialized')[0] as HTMLIFrameElement
                const iframe2Doc = iframe2.contentDocument
                if(iframe2Doc){
                    iframe2Doc.addEventListener('click', (event:any) => {
                        //console.log('clicked')
                        const inputFields = iframe2Doc.querySelectorAll('input,textarea')
                        //console.log(inputFields)
                        inputFields.forEach((inputField) => {
                            if(inputField.hasAttribute('listener')) return //fixed
                            inputField.setAttribute('listener','true')
                            inputField.addEventListener('input', (event:any) => { // may memory problem dito nag stack yung event listener
                                const target = event.target as HTMLInputElement
                                let genderBias = []
                                Object.keys(dictionary).forEach(word => {
                                    const regex = new RegExp(`\\b${word}\\b`, 'gi')
                                    if(regex.test(target.value) && !genderBias.includes(word)){
                                        genderBias.push(word)
                                       
                                    }
                                })

                                if(arrLength !== genderBias.length){
                                    setGenderWord(genderBias)
                                    setDisplay(`Gender bias: ${genderBias.join(', ')}`)
                                    setOp(1)
                                }
                                if(genderBias.length === 0){
                                    setOp(0)
                                }

                                arrLength = genderBias.length
                                console.log(event.target.value)
                            })
                        })
                    })
                }
            } catch (error) {
                console.log('ey')
                setDisplay('Document not found: Reloading in 5 secs')
                setOp(1)
                setTimeout(() => {
                    setOp(0)
                    window.location.reload()
                },5000)
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
             {/*isDocumentLoaded ? `Gender-bias: ${genderWord.join(', ')}` : 'Document not found: Reloading in 5 secs'*/}    
          </div>
    )
}

export default h5pListenerToaster
