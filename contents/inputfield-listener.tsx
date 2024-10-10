//import cssText from "data-text:~/contents/input-field-listener.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  //matches: ["<all_urls>"],
  matches: ["https://mail.google.com/mail/*"],
  //css: ["font.css"]
}

// export const getStyles = () => { //nag export din ako ng style na gagamitin ko para sa export default ko
//   const style = document.createElement("style") 
//   style.textContent = cssText
//   return style
// }

  




const toastMessageForGenderBias = () => {
  const [op,setOp] = useState(0)
  let genderBias = []
  const [genderWord,setGenderWord] = useState('')
  const dummyData = ['man', 'woman', 'other', 'unknown']

  useEffect(()=>{
    document.addEventListener("input", (event:InputEvent) => {
      const target = event.target as HTMLInputElement

      if(target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA'){
        console.log(target.value)

        dummyData.forEach((word) => {
          if(target.value.includes(word) && !genderBias.includes(word)){
            genderBias.push(word)
            setGenderWord(word)
            //Show the toast
            setOp(1)
            setTimeout(()=>{
              setOp(0)
            },2000)
            //Close the toast
          }
        })
        if(target.value === ''){
          genderBias = []
        }
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
      Gender-bias: {genderWord}
    </div>
  )
}

export default toastMessageForGenderBias