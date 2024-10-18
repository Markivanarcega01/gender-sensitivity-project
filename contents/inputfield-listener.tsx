//import cssText from "data-text:~/contents/input-field-listener.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  //matches: ["<all_urls>"],
  matches: ["https://mail.google.com/mail/*", "https://workspace.upou.edu.ph/*"],
  all_frames: true,
  //css: ["font.css"]
}

// export const getStyles = () => { //nag export din ako ng style na gagamitin ko para sa export default ko
//   const style = document.createElement("style") 
//   style.textContent = cssText
//   return style
// }

  




const toastMessageForGenderBias = () => {
  const [op,setOp] = useState(0)
  const [genderWord,setGenderWord] = useState([''])
  const dummyData = ['man', 'woman', 'other', 'unknown']
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
  let arrLength = 0

  useEffect(()=>{
    window.addEventListener("input", (event:InputEvent) => {
      const target = event.target as HTMLInputElement
      let genderBias = []
      console.log(target)
      if(target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA'){
        console.log(target.value)
        Object.keys(dictionary1).forEach(word =>{
          const regex = new RegExp(`\\b${word}\\b`, 'gi')
          //const regex2 = new RegExp(word, 'gi')
          if(regex.test(target.value) && !genderBias.includes(word)){ //If word in INPUT && If word not in genderBias
            genderBias.push(word)
          }
        })
        
        if(arrLength !== genderBias.length){
          setGenderWord(genderBias)
          setOp(1)
          setTimeout(()=>{
            setOp(0)
          },2000)
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
      Gender-bias: {genderWord.join(', ')}
    </div>
  )
}

export default toastMessageForGenderBias