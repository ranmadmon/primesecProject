import {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import '../CssFiles/Form.css';
import axios from "axios";
import OtpComponent from "./OtpComponent.jsx";
import {LOGIN_URL} from "../../Utils/Constants.jsx";
import Error from "./Error.jsx";

function Register() {
    const [name, setName] = useState(" ");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [showPassword,setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOtpComponent, setShowOtpComponent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [email, setEmail] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("")
    const navigate = useNavigate();

    const [errorCode, setErrorCode] = useState(-1);
    const [usernameErrorCode, setUsernameErrorCode] = useState(null);
    const [phoneErrorCode, setPhoneErrorCode] = useState(null);
    const [emailErrorCode, setEmailErrorCode] = useState(null);
    const [passwordErrorCode, setPasswordErrorCode] = useState(null);
    const [showError, setShowError] = useState(false)

    const USERNAME_TAKEN = 1001;
    const PHONE_TAKEN = 1002;
    const EMAIL_TAKEN = 1003;
    const INVALID_REPEAT_PASSWORD = 1004;

    useEffect(() => {
        document.getElementById("first-name").focus();
    },[])

    function register() {
        axios.get("http://localhost:8080/register?userName=" + username + "&password=" + password + "&name=" + name + "&lastName=" + lastName + "&email=" + email + "&role=" + jobTitle + "&phoneNumber=" + phoneNumber)
            .then(response => {
                console.log(response.data)
                if (response.data != null) {
                    if (!response.data.success) {
                        console.log(response.data)
                        setEmailErrorCode(response.data.emailTaken)
                        setUsernameErrorCode(response.data.usernameTaken)
                        setPhoneErrorCode(response.data.phoneTaken)
                    } else {
                        console.log("ok")
                        setShowOtpComponent(true);
                    }
                }
            })
    }



    const onOtpSubmit = (otp) => {
        axios.get("http://localhost:8080/check-otp-to-register?username=" + username + "&otp=" + otp)
            .then(response => {
                if (response.data.success) {
                    if (!response.data.registeredSuccessfully) {
                        setOtpVerified(false);
                    } else {
                        setOtpVerified(true);
                        setTimeout(()=>{
                            setShowOtpComponent(false);
                            navigate(LOGIN_URL);
                            window.location.reload()
                        }, 5000)

                    }
                }
            })
    }
    const allFieldsFilled = () => {
        try{
            const checkFirstName = document.getElementById("first-name")
            const checkLastName = document.getElementById("last-name")
            const checkEmail = document.getElementById("email")
            const checkPhone = document.getElementById("phone")
            const checkUsername = document.getElementById("username")
            const checkJobTitle = document.getElementById("job-title")
            const checkPassword = document.getElementById("password")
            const checkConfirmPassword = document.getElementById("confirm-password")
            return (
                checkFirstName.checkValidity() &&
                checkLastName.checkValidity() &&
                checkEmail.checkValidity() &&
                checkPhone.checkValidity() &&
                checkUsername.checkValidity() &&
                checkJobTitle.checkValidity() &&
                checkPassword.checkValidity()&&
                checkConfirmPassword.checkValidity()
            );
        } catch (e){
            console.log(e)
        }
    }
    function getInput(id, title, value, setValue, type, pattern, requirementMessage, error, message, setError) {
        return (
            <div className="flex input-container">
                <label className="form-label">{title}: {errorCodeComponent(error, message)}</label>
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                    {type === "password" && (
                        <button className="show-password"
                                onClick={(event) => {
                                    title === "Password" ? handleShowPassword(event) : handleShowConfirmPassword(event);
                                }}>
                        </button>
                    )}
                    <input
                        required
                        className="form-input"
                        id={id}
                        type={type}
                        name={title}
                        value={value}
                        pattern={pattern}
                        onChange={(event) => {
                            setValue(event.target.value);
                            if (error !== null && setError) {
                                setError(null);
                            }
                        }}
                        placeholder={title}
                        size={1}
                        aria-expanded={false}
                    />
                    {/* הצגת הודעות שגיאה מתחת ל-Input */}
                    {error && <div className="requirement-message error-message">{message}</div>}
                    <div className="requirement-message">{requirementMessage}</div>
                </div>
            </div>
        );
    }

    const handleRegex = (type) => {
        let regex = ""
        switch (type) {
            case "firstname":
                regex = "^(?=.*[a-z]).{4,}$";
                break;
            case "lastname":
                regex = "^(?=.*[a-z]).{3,}$";
                break;
            case "phone":
                regex = "05\\d{8}";
                break;
            case "email":
                regex = "[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z0-9]+.{2,}$";
                break;
            case "username":
                regex = "[a-zA-Z0-9]{6,}";
                break;
            case "password":
                regex = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+\\-]).{8,}';
                break;
            case "confirm-password":
                regex = password;
                break;
        }
        return regex
    }
    const handleRequirementMessage = (type) => {
        let requirementMessage = ""
        switch (type) {
            case "firstname":
                requirementMessage = "At least 3 characters";
                break;
            case "lastname":
                requirementMessage = "At least 3 characters";
                break;
            case "phone":
                requirementMessage = "Example: 05XXXXXXXX ";
                break;
            case "email":
                requirementMessage = "Example: example@example.com";
                break;
            case "password":
                requirementMessage = "At least 8 Characters, lower and uppercase letters,+ numbers and special characters [!@$%]";
                break;
            case "username":
                requirementMessage = "At least 6 characters, letters and numbers";
                break;
            case "confirm-password":
                requirementMessage = "Should be exactly like the chosen password";
                break;
        }
        return requirementMessage
    }
    function handleShowPassword(event) {
        setShowPassword(!showPassword);
        let passwordToShow = document.getElementById("password")
        if (showPassword) {
            event.currentTarget.style.backgroundImage = 'url("src/assets/form/hide_password.png")';
            passwordToShow.setAttribute("type", "text");
        } else {
            event.currentTarget.style.backgroundImage = 'url("src/assets/form/show_password.png")';
            passwordToShow.setAttribute("type", "password");
        }
    }
    function handleShowConfirmPassword(event) {
        setShowConfirmPassword(!showConfirmPassword);
        let confirmPasswordToShow = document.getElementById("confirm-password")
        if (showConfirmPassword) {
            event.currentTarget.style.backgroundImage = 'url("src/assets/form/hide_password.png")';
            confirmPasswordToShow.setAttribute("type", "text");
        } else {
            event.currentTarget.style.backgroundImage = 'url("src/assets/form/show_password.png")';
            confirmPasswordToShow.setAttribute("type", "password");
        }
    }
    function showErrorCode() {
        let errorMessage = "";
        switch (errorCode) {
            case -1 :
                errorMessage = "Please fill in all fields";
                break;
            case  USERNAME_TAKEN :
                errorMessage = "username not available";
                break;
            case  PHONE_TAKEN :
                errorMessage = "phone-number not available";
                break;
            case  EMAIL_TAKEN :
                errorMessage = "email is not available";
                break;
            case  INVALID_REPEAT_PASSWORD :
                errorMessage = "Invalid repeat password ";
                break;
        }
        return errorMessage;
    }
    function errorCodeComponent(error, message) {
        return (
            <div>
                {error&&(<label style={{color: "red", marginTop: "5px"}}>
                        {message}
                    </label>
                )}
            </div>
        )
    }

    return (
        <div className="flex form-page">
            <div className="flex form-container">
                <div className={"flex left-side"}>
                    <div className={"flex form-headers"}>
                        <text style={{fontSize: "1.8rem", fontWeight: "bold"}}>Register</text>
                        <text style={{fontSize: "1.2rem", fontWeight: "bold"}}>Thank you for joining us 🫡</text>
                    </div>
                    <div className={"flex form"}>
                        <div className="input-pair">
                            {getInput("first-name","Name", name, setName, "text", handleRegex("firstname"), handleRequirementMessage("firstname"))}
                            {getInput("last-name","Last Name", lastName, setLastName, "text", handleRegex("lastname"), handleRequirementMessage("lastname"))}
                        </div>
                        <div className={"input-pair"}>
                            {getInput("email","Email", email, setEmail, "email", handleRegex("email"), handleRequirementMessage("email"), emailErrorCode, "email is taken", setEmailErrorCode)}
                            {getInput("phone","Phone", phoneNumber, setPhoneNumber, "tel", handleRegex("phone"), handleRequirementMessage("phone"), phoneErrorCode, "phone is taken", setPhoneErrorCode)}
                        </div>
                        <div className="input-pair">
                            {getInput("username","Username", username, setUsername, "username", handleRegex("username"), handleRequirementMessage("username"), usernameErrorCode, "username is taken", setUsernameErrorCode)}

                            <div className={"flex input-container"}>

                                <label className={"form-label"}>Job Title:</label>
                                <div style={{display: "flex", width: "100%"}}>

                                    <select required className={"form-input"} id="job-title" value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}>
                                        <option value="" disabled>Select Job Title</option>
                                        <option value="Student">Student</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="input-pair">
                            {getInput("password","Password", password, setPassword, "password", handleRegex("password"), handleRequirementMessage("password"))}
                            {getInput("confirm-password","Confirm Password", passwordConfirm, setPasswordConfirm, "password", handleRegex("confirm-password"), handleRequirementMessage("confirm-password"), passwordErrorCode, "the passwords don't match")}
                        </div>
                    </div>
                    <div className={"submit-container"}>
                        {errorCode !== -1 && <Error errorMessage={showErrorCode()}/>}
                        <div className={"input-pair"}>
                            <button onClick={() => register()} id={"submit-button"}
                                    className={allFieldsFilled() ? "active" : ""}
                                    disabled={!allFieldsFilled()}>
                                Register Now
                            </button>
                            <div className={"have-an-account"}>
                                <label>Already have an account?</label>
                                <button className={"have-an-account-button"} onClick={() => navigate(LOGIN_URL)}> Login
                                    Now!
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
                <div className={"right-side"}>
                    <div className={"image-container"}>
                        <img className={"form-image"} style={{width: "520px", height: "420Px"}}
                             src={"src/assets/icons/math-logo.png"}
                             alt={"register-page-image"}/>
                    </div>
                </div>
            </div>
            {showOtpComponent && <OtpComponent arrayLength={6} username={username} onOtpSubmit={onOtpSubmit} isVerified={otpVerified} verifiedMessage={"Registration successful, you're transferred to log in"} unverifiedMessage={"Registration was unsuccessful, try entering the code again"}/>}
        </div>

    );

}

export default Register;