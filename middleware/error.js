class ErrorHandler extends Error{
    constructor(message , statusCode){
        super(message)
        this.statusCode = statusCode
    }

}
export const  errorMiddleware = (err,req,res,next)=>{
    err.message = err.message || "Internal Server Error"
    err.statusCode = err.statusCode || 500
    if(err.name === "CaseError"){
        const message = `Resource not found. Invalid ${err.path}`
        err = new ErrorHandler(message,400)

    }
    if(err.code === 11000){
        const message = `DUBLICATE  ${Object.keys(err.KeyValue)} Entered`
        err = new ErrorHandler(message,400)

    }
    if(err.name === "JsonwebTokenError"){
        const message = `json webToken invalid, Try Again`
        err = new ErrorHandler(message,400)

    }
    if(err.name === "TokenExpiredError"){
        const message = `json web token expired. Try Again`
        err = new ErrorHandler(message,400)

    }
    return  res.status(err.statusCode).json({
        success:false,
        message:err.message
    })

}
export default ErrorHandler