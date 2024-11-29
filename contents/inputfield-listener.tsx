import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { dictionary } from "~components/dictionary"

export const config: PlasmoCSConfig = {
  matches: ["https://mail.google.com/mail/*", "https://workspace.upou.edu.ph/*"],
}



  




const toastMessageForGenderBias = () => {
  const [op,setOp] = useState(0)
  const [genderWord,setGenderWord] = useState([''])
  const [display,setDisplay] = useState('')
  
  let arrLength = 0

  useEffect(()=>{
    document.addEventListener("input", (event:InputEvent) => {
      const target = event.target as HTMLInputElement
      let genderBias = []
      console.log(target)
      if(target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA'){
        console.log(target.value)
        Object.keys(dictionary).forEach(word =>{
          const regex = new RegExp(`\\b${word}\\b`, 'gi')
          //const regex2 = new RegExp(word, 'gi')
          if(regex.test(target.value) && !genderBias.includes(word)){ //If word in INPUT && If word not in genderBias
            genderBias.push(word)
          }
        })

        if(arrLength !== genderBias.length){
          setGenderWord(genderBias)
          setDisplay(`Gender-bias: ${genderBias.join(', ')}`)
          setOp(1)
        }
        if(genderBias.length === 0){
          setOp(0)
        }
  
        arrLength = genderBias.length
        console.log(genderBias)
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
    </div>
  )
}

export default toastMessageForGenderBias