import { type FunctionComponent, useEffect, useState } from "react"
import { useParams } from "react-router"

const AboutPage: FunctionComponent = () => {
  const [message, setMessage] = useState("")
  const { param } = useParams()

  useEffect(() => {
    if (param) {
      setMessage("The parameter is " + param)
    } else {
      setMessage("No parameter was provided")
    }
  }, [param])

  return (
    <div>
      <p>This is the about page.</p>
      <p>{message}</p>
    </div>
  )
}

export default AboutPage
