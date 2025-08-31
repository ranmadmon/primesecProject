import "../CssFiles/Error.css"

export default function Error({errorMessage}){
    return(
        <div className={"error-component"}>
            <img className={"error-icon"} src={"src/assets/icons/img.png"}/>
            <label className={"error-code"}> {errorMessage}</label>
        </div>
    )
}
