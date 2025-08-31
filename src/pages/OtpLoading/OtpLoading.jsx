    import "./OtpLoading.css"
    import {useEffect, useState} from "react";
    export default function OtpLoading({isVerified, verifiedMessage, unverifiedMessage}){
        const [canContinue, setCanContinue] = useState(false);
        const gray = "#8a8a8a"
        const green = "#07b481"
        const red = "#ff3242"

        useEffect(()=>{
            setTimeout(()=>{
                setCanContinue(true)
            }, 2000)
        }, [])
        function checkValidity(){
            return(
                <div className="loader">
                    <svg width="115px" height="115px" viewBox="0 0 133 133">
                        <g id="before-check-group" stroke="none" strokeWidth="1" fill="none" fillRule={"evenodd"}>
                            <circle
                                id="filled-circle"
                                fill={gray}
                                cx="66.5"
                                cy="66.5"
                                r="54.5"
                            />
                            <circle
                                id="white-circle"
                                fill="#FFFFFF"
                                cx="66.5"
                                cy="66.5"
                                r="55.5"
                            />
                            <circle
                                id="outline"
                                stroke={gray}
                                strokeWidth="4"
                                cx="66.5"
                                cy="66.5"
                                r="54.5"
                            />
                        </g>
                    </svg>
                    <text style={{color: gray, fontWeight: "bold", fontSize: "1.2rem"}}>Processing your code</text>
                </div>
            )
        }
        function verified() {
            return (
                <div className={"loader"}>
                    <svg width="115px" height="115px" viewBox="0 0 133 133" >
                        <g id="check-group" stroke="none" strokeWidth="1" fill="none" fillRule={"evenodd"}>
                            <circle
                                id="filled-circle"
                                fill={green}
                                cx="66.5"
                                cy="66.5"
                                r="54.5"
                            />
                            <circle
                                id="white-circle"
                                fill="#FFFFFF"
                                cx="66.5"
                                cy="66.5"
                                r="55.5"
                            />
                            <circle
                                id="outline"
                                stroke={green}
                                strokeWidth="4"
                                cx="66.5"
                                cy="66.5"
                                r="54.5"
                            />
                            <polyline
                                id="check"
                                stroke="#FFFFFF"
                                strokeWidth="5.5"
                                points="41 70 56 85 92 49"
                            />
                        </g>
                    </svg>
                    <text style={{color: green, fontWeight: "bold", fontSize: "1.2rem"}}>{verifiedMessage}</text>
                </div>
            )
        }
        function unverified(){
            return (
                <div className={"loader"}>
                    <svg width="115px" height="115px" viewBox="0 0 133 133">
                        <g id="unverified-group" stroke="none" strokeWidth="1" fill="none">
                            <circle
                                id="filled-circle"
                                fill={red}
                                cx="66.5"
                                cy="66.5"
                                r="54.5"
                            />
                            <circle
                                id="white-circle"
                                fill="#FFFFFF"
                                cx="66.5"
                                cy="66.5"
                                r="55.5"
                            />
                            <circle
                                id="outline"
                                stroke={red}
                                strokeWidth="4"
                                cx="66.5"
                                cy="66.5"
                                r="54.5"
                            />
                            <g id="unverified">
                                <line id="path2" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeMiterlimit="10"
                                      x1="8.5" y1="41.5" x2="41.5" y2="8.5"/>
                                <line id="path3" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeMiterlimit="10"
                                      x1="41.5" y1="41.5" x2="8.5" y2="8.5"/>
                            </g>
                        </g>
                    </svg>
                    <text style={{color: red}}>{unverifiedMessage}</text>
                </div>
            )
        }

        return (
            <div>
                {(canContinue)?(isVerified ? verified() : unverified()) : checkValidity()}
            </div>
        )
    }