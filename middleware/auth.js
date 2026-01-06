const jwt = require("jsonwebtoken");
const publicRoutes = ["/", "/app/login", "/app/signup", "/app/confirm", "/app/countries", "/app/services", "/api/countries", "/api/services", "/about", "/contactus", "/privacy-policy", "/blog", "/blog-detail"];

const authMiddleware = (req, res, next) => {
    let token = req.cookies?.token;
    const isPublicRoute = publicRoutes.includes(req.path);
    // Allow public API routes (countries and services can be accessed without auth)
    const isPublicApiRoute = req.path === '/api/countries' || req.path === '/api/services';


    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            res.locals.customer = decoded.customer;
            req.customer = decoded.customer;
        } catch (err) {
            console.error("JWT Verification Error:", err);
            res.clearCookie("token", { path: "/" });
            if (!isPublicRoute && !isPublicApiRoute) {
                return res.redirect("/app/login?alert=Please login to access this page");
            }
        }
    } else {
        res.locals.customer = null;
    }

    if (isPublicRoute || isPublicApiRoute) {
        console.log("Accessing public route:", req.path);
        return next();
    }

    if (!res.locals.customer) {
        console.log("No valid session, redirecting to login");
        return res.redirect("/app/login?alert=Please login to access this page");
    }

    next();
};

module.exports = authMiddleware;

// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//     let token = req.cookies?.token; 

//     if (!token) {
//         res.locals.customer = null; 
//         return next();
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
//         res.locals.customer = decoded.customer; 
//         req.customer = decoded.customer; 
//         // console.log("JWT_SECRET:", process.env.JWT_SECRET);
//     } catch (err) {
//         console.error("JWT Verification Error:", err);
//         res.locals.customer = null;
//     }

//     next();
// };
// module.exports = authMiddleware;

