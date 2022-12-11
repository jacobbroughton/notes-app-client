import { ReactEventHandler } from "react"
import "./Input.css"

type InputProps = {
    onChange: ReactEventHandler,
    type: String,
    placeholder: String,
    value: any
}

const Input = ({ onChange, type, placeholder, value, pattern }: InputProps) => {
    return <input type={type} placeholder={placeholder} onChange={onChange} value={value} pattern={pattern}/>
}

export default Input