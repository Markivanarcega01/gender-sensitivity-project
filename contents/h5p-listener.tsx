import type { PlasmoCSConfig } from "plasmo"
import delegate from "delegate-it"
import { useEffect, useState, type HtmlHTMLAttributes } from "react"

export const config: PlasmoCSConfig = {
  //matches: ["<all_urls>"],
  matches: ["https://workspace.upou.edu.ph/*"],
  //css: ["font.css"]
}
/**
 * window.load to find the h5p main wrap
 * Then add an click listener to it
 * The click will find all the textarea and inputs in the current webpage
 * Then enable the gender-bias response
 */



const h5pListenerToaster = () => {
    const [op,setOp] = useState(0)
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
    let genderBias = []
    const [genderWord,setGenderWord] = useState([''])

    useEffect(() => {
        window.addEventListener('load', (event) => {
            try {
                const iframe = document.getElementsByClassName('h5p-player w-100 border-0')[0] as HTMLIFrameElement
                const iframeDoc =  iframe.contentDocument
                const iframe2 = iframeDoc.getElementsByClassName('h5p-iframe h5p-initialized')[0] as HTMLIFrameElement
                const iframe2Doc = iframe2.contentDocument
                if(iframe2Doc){
                    iframe2Doc.addEventListener('click', (event:any) => {
                        console.log('clicked')
                        const inputFields = iframe2Doc.querySelectorAll('input,textarea')
                        console.log(inputFields)
                        inputFields.forEach((inputField) => {
                            inputField.addEventListener('input', (event:any) => {
                                const target = event.target as HTMLInputElement
                                Object.keys(dictionary1).forEach(word => {
                                    const regex = new RegExp(`\\b${word}\\b`, 'gi')
                                    if(regex.test(target.value) && !genderBias.includes(word)){
                                        genderBias.push(word)
                                        setGenderWord(genderBias)
                                        setOp(1)
                                        setTimeout(() => {
                                            setOp(0)
                                        }, 2000)
                                    }
                                })
                                console.log(genderBias)

                                if(target.value === ''){
                                    genderBias = []
                                }
                                console.log(event.target.value)
                            })
                        })
                    })
                }
            } catch (error) {
                console.log(error)
                setInterval(function() {
                    location.reload()
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
            Gender-bias: {genderWord}
          </div>
    )
}

export default h5pListenerToaster
// try comment

//console.log(dom)
// console.log(document)
//         const iframe = document.getElementsByClassName('h5p-player w-100 border-0')[0] as HTMLIFrameElement
//         console.log(iframe) //This returns the iframe tag
//         const iframeDoc =  iframe.contentDocument
//         console.log(iframeDoc) // This returns the child document
//         if (iframeDoc) {
//             const iframe2 = iframeDoc.getElementsByClassName('h5p-iframe h5p-initialized')[0] as HTMLIFrameElement
//             console.log(iframe2)
//             const iframe2Doc = iframe2.contentDocument
//             console.log(iframe2Doc) //This return the child document of iframe2
//             if (iframe2Doc) {
//                 //const container = iframe2Doc.getElementsByClassName('h5p-essay-input-field-textfield')[0]
//                 const inputFields = iframe2Doc.querySelectorAll('input,textarea')
//                 console.log(inputFields) //This return nulls
//                 inputFields.forEach((inputField) => {
//                     inputField.addEventListener('input', (event:any) => {
//                         console.log(event.target.value)
//                     })
//                 })
//                     // if(container){
//                     //     container.addEventListener('input', (event:any) => { //Then I added an event listener in the container of the input/textarea field and use delegation
//                     //         console.log(event.target.value)
//                     //     })
//                     // }
//             }
//         }