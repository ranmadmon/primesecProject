import React, {useEffect, useRef, useState} from "react";
import "../CssFiles/Form.css"
import OtpLoading from "./OtpLoading/OtpLoading.jsx";

const OtpComponent = ({username = "Guest", length=6 , onOtpSubmit=()=>{}, isVerified, verifiedMessage, unverifiedMessage}) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const [otpToSubmit, setOtpToSubmit] = useState("");
    const inputRef = useRef([]);
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (inputRef.current [0]){
            inputRef.current[0].focus();
        }
    },[])
    const handleChange = (e,index) => {

        if (isNaN(e.target.value)){return "";}
        const value = e.target.value;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length-1);
        setOtp(newOtp);

        const combinedOtp = newOtp.join("");
        if (combinedOtp.length === length){
            setOtpToSubmit(combinedOtp);
        }
        if(value && (index < length-1 ) && inputRef.current[index + 1]) {
            inputRef.current[index+1].focus();
        }

    }
    const onPaste = (e) => {
        if (isNaN(e.target.value)){return "";}
        e.preventDefault();
        const clipboard = e.clipboardData.getData("text");
        const pastedOtp = clipboard.split("", 6)
        pastedOtp.forEach((char, index)=>{
            if (isNaN(char)) pastedOtp[index] = "";
        })
        if (pastedOtp.length === 6){
            setOtp(pastedOtp)
        } else if (pastedOtp.length > 6){

        }
    }
    const handleKeyDown = (e,index) => {
        const key = e.key.toLowerCase()
        console.log(key)
        if ((key === "backspace" || key === "delete") && !otp[index] && index>0 && inputRef.current[index-1]) {
            inputRef.current[index-1].focus();
        }
        if ((key === "arrowleft") && otp[index] && index>0 && inputRef.current[index-1]) {
            e.preventDefault()
            inputRef.current[index-1].focus();
        }
        if ((key === "arrowright") && otp[index] && (index < length-1 ) && inputRef.current[index+1]){
            inputRef.current[index+1].focus();
        }

    }
    const handleClick = (index) => {
        inputRef.current[index].setSelectionRange(1,1);
        const indexOfEmpty = otp.indexOf("");
        inputRef.current[indexOfEmpty].focus();
    }
    return (
        <div className={"code-container"} style={{textAlign: "center", marginTop: "20px"}}>
            <div className={"form-headers"} style={{display: "flex", justifyContent: "space-between"}}>
                <text style={{fontSize: "2.3rem", fontWeight: "bold",color: "#2f4f4f"}}>Security Check</text>
                <text style={{fontSize: "1.5rem", fontWeight: "bold",color: "#2f4f4f"}}>Welcome {username}, {<br/>}Your code was sent to you via SMS</text>
            </div>
            <div className={"input-container"} style={{gap: "1.5rem",display: "contents"}}>
                <div className={"otp-input-field"} style={{display: "flex", gap: "1.3rem"}}>
                    {otp.map((data,index) => {
                        return (
                            <input key={index}
                                   required
                                   className={"otp-input"}
                                   ref={ (input) => (inputRef.current[index] = input)}
                                   id={"box"}
                                   type="text"
                                   value={data}
                                   maxLength={1}
                                   onChange={(e) => {handleChange(e, index)}}
                                   onKeyDown={(e) => {handleKeyDown(e, index)}}
                                   onClick={() => handleClick(index)}
                                   onPaste={(e) => onPaste(e)}
                                   style={{width: "1.8rem",textAlign:"center",padding:0,margin:0}}/>)
                    })}
                </div>

                <button
                    className={(otpToSubmit.length === 6) ? "active" : ""}
                    disabled={otpToSubmit.length < 6}
                    style={{width: "13rem"}}
                    id={"submit-button"}
                    onClick={() =>
                    {
                        onOtpSubmit(otpToSubmit);
                        setShowLoading(true)
                        setTimeout(()=>{
                            setShowLoading(false)
                        },5000)
                    }
                    }
                >
                    Submit
                </button>
            </div>
            {
                showLoading &&
                <div className={"loading"} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <OtpLoading isVerified={isVerified} verifiedMessage={verifiedMessage} unverifiedMessage={unverifiedMessage}/>
                </div>
            }
        </div>
    );
};

export default OtpComponent;
