import { useState, useEffect } from "react"

function IndexPopup() {
  const [currentUrl, setCurrentUrl] = useState<string>("")

  const getCurrentUrl = async ()=>{
      const [tab] = await chrome.tabs.query({active:true,currentWindow:true})
      setCurrentUrl(tab.url)
  }

  useEffect(()=>{
    getCurrentUrl()
  },[currentUrl])

  return (
    <div
      style={{
        padding: 16
      }}>
      <h2>
        You are currently at {currentUrl}
      </h2>
      <a href="https://docs.plasmo.com" target="_blank">
        View Docs
      </a>
    </div>
  )
}

export default IndexPopup
