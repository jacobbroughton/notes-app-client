import { ReactEventHandler } from "react"
import "./Input.css"

type InputProps = {
    onChange: ReactEventHandler,
}

const Input = ({ onChange }: InputProps) => {
    return <input onChange={onChange}/>
}

export default Input