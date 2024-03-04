import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "geekgrove",
    password: "mazhar@2472",
    port: 5432
});
  db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/populartags', express.static('public'));
app.use('/post', express.static('public'));
app.use('/channel', express.static('public'));
app.use('/latestvid', express.static('public'));
app.get("/", (req, res) => {
    res.render("index.ejs");
});
app.get("/post/:tag", (req, res) => {
    const tag = req.params.tag;
    console.log(tag);
    const tagpost=getpostbytag(tag)
    res.render("post.ejs",{post:tagpost,user:currentuser});
});
app.get("/channel", (req, res) => {
    res.render("channel.ejs");
});
 app.get("/latestvid/:tag", (req, res) => {
    const tag = req.params.tag;
    console.log(tag);
    const tagvideo=getlatestvideobytag(tag);
    res.render("latestvid.ejs",{videoList:tagvideo,user:currentuser});
}); 
app.get('/populartags/:tag', (req, res) => {
    const tag = req.params.tag;
    console.log(tag);
    // Assuming you have a function to get videos related to the tag
    const tagvideo = getVideosByTag(tag);
    //const  tagvideo=tagVideos["#AI ML"];
    // Render the EJS page with tag-specific video data
    console.log(tagvideo);
    res.render('populartags.ejs', { tagVideos: tagvideo,user:currentuser });
});

app.get("/ytchannels", (req, res) => {
    res.render("ytchannels.ejs",{channels:channels,user:currentuser});
});
app.get("/dashboard", (req, res) => {
    res.render("dashboard.ejs",{user:currentuser});
});
app.post("/subscribe", async (req, res) => {
    const email = req.body.subemail;

    try {
        // Check if the email already exists
        const result = await db.query("SELECT * FROM subscribers WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            // If the email doesn't exist, insert it
            const insertResult = await db.query("INSERT INTO subscribers (email) VALUES ($1) RETURNING *", [email]);
            console.log("Email added to the database:", insertResult.rows[0].email);
            res.redirect("/");
        } else {
            console.log("Email already exists in the database:", email);
            res.redirect("/");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing the request");
    }
});
app.get('/searchpost', (req, res) => {
    // Retrieve the search query from the URL parameters
    const searchQuery = req.query.search;
    console.log(searchQuery);
        // Replace this with your actual data fetching logic

    // Find the post based on the search query (using the key directly)
    const foundPost = getpostbytag(searchQuery);
    console.log(foundPost!==null);
    if(foundPost){
        res.render('post.ejs', { post: foundPost });
    }
    else{
        res.render('post.ejs', { post: emptyPost });
    }
    // Render the "post.ejs" template with the found post
    
});

/*app.post("/subscribe",(req,res)=>{
    const email=req.body.subemail;
    subscribers.push(email);
    console.log(subscribers[subscribers.length-1]);
    res.redirect("/");
})*/
app.get("/signup", (req, res) => {
    res.render("signuppage.ejs");
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    try {
      // Access form data using req.body
      let x = await addFormDataToUserDetails(req.body);
  
      if (x === 0) {
        return res.render('signuppage.ejs', { error: 'Email already exists. Try with a different one.' });
      } else if (x === 1) {
        const lastUserEmail = userorder[userorder.length - 1];
        console.log('Sign up successful:', lastUserEmail);
        return res.redirect('/');
      } else {
        return res.status(500).send('Internal Server Error');
      }
    } catch (error) {
      console.error('Error processing signup:', error);
      return res.status(500).send('Internal Server Error');
    }
});
/*app.post("/signup", (req, res) => {
    // Access form data using req.body
    let x=addFormDataToUserDetails(req.body);
    if(x==0){
        res.render("signuppage.ejs", { error: "Email already exist try with different one." });
    }
   else{
        const lastUserEmail = userorder[userorder.length - 1];
        const lastUserDetails = userdetails[lastUserEmail];
        console.log(lastUserEmail,lastUserDetails);
        console.log("sign up successful");
        res.redirect("/");
    }
});*/

// Render signin page
app.get("/signin", (req, res) => {
    res.render("signin.ejs");
});


app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query the database to check if the user exists and the password is correct
        const result = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

        if (result.rows.length > 0) {
            console.log("Signin successful");

            // Extract user details from the database result
            const user = result.rows[0];
            console.log(user);
            // Update currentuser with the details of the signed-in user
            currentuser.firstName = user.firstname;
            currentuser.lastName = user.lastname;
            currentuser.email = user.email;
            currentuser.preferredTopics = user.preferredtopics.split(",");
            currentuser.preferredCourses = user.preferredcourses.split(",");
            currentuser.preferredChannels = user.preferredchannels.split(",");

            res.redirect("/dashboard");
        } else {
            res.render("signin.ejs", { error: "Incorrect email or password. Please try again." });
        }
    } catch (error) {
        console.error("Error executing query", error);
        res.render("signin.ejs", { error: "An error occurred. Please try again later." });
    }
});


// Handle signin form submission
/*app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    if (userdetails.hasOwnProperty(email)) {
        if (userdetails[email].password === password) {
            console.log("Signin successful");

            // Update currentuser with the details of the signed-in user
            currentuser.firstName = userdetails[email].firstName;
            currentuser.lastName = userdetails[email].lastName;
            currentuser.email = email;
            currentuser.preferredTopics = userdetails[email].preferredTopics.split(",");
            currentuser.preferredCourses = userdetails[email].preferredCourses.split(",");
            currentuser.preferredChannels = userdetails[email].preferredChannels.split(",");

            res.redirect("/dashboard");
        } else {
            res.render("signin.ejs", { error: "Incorrect password. Please try again." });
        }
    } else {
        res.render("signin.ejs", { error: "Email not found. Please check your email and try again." });
    }
});*/

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
const currentuser={
    profilePicture:"assests/images/pimg/naruto.png",
    firstName:"Sign in",
    lastName:"",
    email:"",
    preferredTopics:[],
    preferredCourses:[],
    preferredChannels:[]
};
const subscribers=[];
const post={
    "Placement-series": {
       title:"Complete C++ Placement DSA Course",
        url: "https://www.youtube.com/embed/videoseries?si=rur9fpDXQIjnXkKr&amp;list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA",
        about1: "Embark on a transformative journey with Love Babbar's DSA Full Placement Series. This comprehensive guide is a treasure trove for anyone aspiring to excel in technical interviews. Babbar's lucid explanations and real-world problem-solving approach demystify complex concepts, empowering learners to navigate coding challenges with confidence. As Love Babbar wisely puts it Elevate your coding skills, unravel the secrets of data structures and algorithms, and pave your way to success in interviews",
        quote: "In the world of coding, every challenge is an opportunity to learn",
        about2: "This series is not just a tutorial; it's a roadmap to unlocking your full coding potential and conquering the challenges of tech recruitment",
        author: {
            img: "assests/images/pimg/profilepic.jpg",
            name: "Mazhar Saifi",
            about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
        }
    },
    "alphaplacementcourse": {
        title:"Bringing Complete Placement Preparation Course | in 3.5 Months | Alpha 5.0",
        url: "https://www.youtube.com/embed/cw6p3BL05Ng?si=1jF_zBnK54vpeIth",
        about1: "Embark on a transformative journey with 'Complete Placement Preparation Course, Alpha 5.0' by Apna College, led by Aman Dhattarwal and Shradha Di. In a condensed 3.5-month timeframe, this course is a beacon for career enthusiasts, offering expert insights and practical strategies. Aman Dhattarwal and Shradha Di bring their combined expertise to elevate your skills, preparing you to conquer interviews and secure your dream placement.",
        quote: "As Aman Dhattarwal wisely states, 'Success in placements is not just a destination; it's a journey of continuous learning.'",
        about2: " This course isn't just about theoretical knowledge but a hands-on roadmap to success. Whether you're navigating technical challenges or polishing your soft skills, Alpha 5.0 is designed to empower you for the competitive job market. Join us in this accelerated learning experience and redefine your path to success.",
        author: {
            img: "assests/images/pimg/profilepic.jpg",
            name: "Mazhar Saifi",
            about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
        }
    },
    "freecodecamp": {
        title:"C++ Tutorial for Beginners - Full Course",
        url: "https://www.youtube.com/embed/vLnPwxZdW4Y?si=cgvLPAIU__z10mVr" ,
        about1: "Dive into the fundamentals of C++ with FreeCodeCamp's comprehensive course, providing a full introduction to core concepts. Whether you're a beginner or looking to solidify your understanding, this course covers it all.",
        quote: "Unlock the power of C++ as you explore key principles, syntax, and applications'",
        about2: " Elevate your programming skills with FreeCodeCamp's expert guidance, ensuring you grasp the essence of C++ programming. Enroll now to embark on a journey that demystifies C++ and sets you on a path to confident and proficient coding.",
        author: {
            img: "assests/images/pimg/profilepic.jpg",
            name: "Mazhar Saifi",
            about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
        }
    },
    "dsa-full-course": {
        title:"Complete C++ Placement DSA Course",
         url: "https://www.youtube.com/embed/videoseries?si=rur9fpDXQIjnXkKr&amp;list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA",
         about1: "Embark on a transformative journey with Love Babbar's DSA Full Placement Series. This comprehensive guide is a treasure trove for anyone aspiring to excel in technical interviews. Babbar's lucid explanations and real-world problem-solving approach demystify complex concepts, empowering learners to navigate coding challenges with confidence. As Love Babbar wisely puts it Elevate your coding skills, unravel the secrets of data structures and algorithms, and pave your way to success in interviews",
         quote: "In the world of coding, every challenge is an opportunity to learn",
         about2: "This series is not just a tutorial; it's a roadmap to unlocking your full coding potential and conquering the challenges of tech recruitment",
         author: {
             img: "assests/images/pimg/profilepic.jpg",
             name: "Mazhar Saifi",
             about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
         }
    },
    "python-course":{
        title:"Learn Python - Full Course for Beginners [Tutorial]",
         url: "https://www.youtube.com/embed/rfscVS0vtbw?si=pYTmdYdW-VhmQ4Zc" ,
         about1: "Embark on a transformative journey with Love Babbar's DSA Full Placement Series. This comprehensive guide is a treasure trove for anyone aspiring to excel in technical interviews. Babbar's lucid explanations and real-world problem-solving approach demystify complex concepts, empowering learners to navigate coding challenges with confidence. As Love Babbar wisely puts it Elevate your coding skills, unravel the secrets of data structures and algorithms, and pave your way to success in interviews",
         quote: "In the world of coding, every challenge is an opportunity to learn",
         about2: "This series is not just a tutorial; it's a roadmap to unlocking your full coding potential and conquering the challenges of tech recruitment",
         author: {
             img: "assests/images/pimg/profilepic.jpg",
             name: "Mazhar Saifi",
             about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
         }
     },
    "webdcourse":{
        title:"Complete Web Dev using MERN stack || Love Babbar",
         url: "https://www.youtube.com/embed/videoseries?si=mtOlJrG-HzmmUjm9&amp;list=PLDzeHZWIZsTo0wSBcg4-NMIbC0L8evLrD" ,
         about1: "Embark on a transformative journey with Love Babbar's DSA Full Placement Series. This comprehensive guide is a treasure trove for anyone aspiring to excel in technical interviews. Babbar's lucid explanations and real-world problem-solving approach demystify complex concepts, empowering learners to navigate coding challenges with confidence. As Love Babbar wisely puts it Elevate your coding skills, unravel the secrets of data structures and algorithms, and pave your way to success in interviews",
         quote: "In the world of coding, every challenge is an opportunity to learn",
         about2: "This series is not just a tutorial; it's a roadmap to unlocking your full coding potential and conquering the challenges of tech recruitment",
         author: {
             img: "assests/images/pimg/profilepic.jpg",
             name: "Mazhar Saifi",
             about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
         }
    },
    "c++course": {
        title:"C++ Tutorial for Beginners - Full Course",
        url: "https://www.youtube.com/embed/vLnPwxZdW4Y?si=cgvLPAIU__z10mVr" ,
        about1: "Dive into the fundamentals of C++ with FreeCodeCamp's comprehensive course, providing a full introduction to core concepts. Whether you're a beginner or looking to solidify your understanding, this course covers it all.",
        quote: "Unlock the power of C++ as you explore key principles, syntax, and applications'",
        about2: " Elevate your programming skills with FreeCodeCamp's expert guidance, ensuring you grasp the essence of C++ programming. Enroll now to embark on a journey that demystifies C++ and sets you on a path to confident and proficient coding.",
        author: {
            img: "assests/images/pimg/profilepic.jpg",
            name: "Mazhar Saifi",
            about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
        }
    },
    "aiml-course": {
        title:"Machine Learning for Everybody – Full Course",
        url: "https://www.youtube.com/embed/i_LwzRVP7bg?si=80lJ6F6o5dNdGdRo"  ,
        about1: "Dive into the fundamentals of C++ with FreeCodeCamp's comprehensive course, providing a full introduction to core concepts. Whether you're a beginner or looking to solidify your understanding, this course covers it all.",
        quote: "Unlock the power of C++ as you explore key principles, syntax, and applications'",
        about2: " Elevate your programming skills with FreeCodeCamp's expert guidance, ensuring you grasp the essence of C++ programming. Enroll now to embark on a journey that demystifies C++ and sets you on a path to confident and proficient coding.",
        author: {
            img: "assests/images/pimg/profilepic.jpg",
            name: "Mazhar Saifi",
            about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
        }
    }
};
const emptyPost= {
        title:"Sorry, the requested post is not available or coming soon. Please try again later",
         url: "https://www.youtube.com/embed/",
         about1: "unavailable",
         quote: "Sorry, the requested post is not available or coming soon. Please try again later",
         about2: "unavailable",
         author: {
             img: "assests/images/pimg/profilepic.jpg",
             name: "Mazhar Saifi",
             about: "Take a glimpse into my world of coding and creativity. Feel free to explore and get in touch for any web development needs. Let's bring your ideas to life!"
        }
}
function getpostbytag(tag){
    return post[tag]||null;
}

const videoData={
    "DSA":[{
        embedSrc:"https://www.youtube.com/embed/TgiY2GPrpf8?si=OSrmoC53uvU_bjk9",
        title:"Complete LIVE 6 months DSA Course with CP topics | Beginner to Advanced",
        description:"Embark on a comprehensive 6-month live Data Structures and Algorithms (DSA) course, covering Competitive Programming (CP) topics. Join Fraz on a journey from beginner to advanced proficiency. Elevate your coding skills, tackle complex problems, and master the art of efficient algorithmic solutions in real-time."
    },
    {
        embedSrc:"https://www.youtube.com/embed/9H_rX1vHuoM?si=G5dXBa06PJN5lmbe",
        title:"DSA v/s Development | What to do for Placements?",
        description:"Dive into the crucial decision of DSA vs. Development for successful placements in this insightful session by Shradha Di from Apna College. Gain valuable insights on which path to prioritize and strategize for a successful career launch. Make informed choices and set the foundation for a promising professional journey."
    },
    {
        embedSrc:"https://www.youtube.com/embed/LjgpB6SwVTM?si=-POwdSkG5yquyIZ4",
        title:"Complete DSA Roadmap To Crack FAANG Interview",
        description:"gUnlocking the FAANG Gateway: Complete DSA Roadmap for Interview Success! 🚀 Join us as we unveil a comprehensive roadmap for mastering Data Structures and Algorithms, your key to acing FAANG interviews. From essential concepts to advanced problem-solving strategies, this video provides a step-by-step guide on how to crack the highly coveted FAANG interviews. Whether you're a seasoned coder or just starting your journey, this roadmap is designed to empower you with the skills needed to stand out in the competitive tech landscape. Tune in and embark on the journey to FAANG success with our expert guidance!"
    }],
    "C++":[{
        embedSrc:"https://www.youtube.com/embed/5glH8dGoeCA?si=dQXJEHRuywb794aU",
        title:"How to Properly Setup C++ Projects",
        description:"Learn the art of setting up C++ projects the right way with The Cherno. In this tutorial, master the proper techniques for configuring and organizing your C++ projects. Enhance your development workflow and set the stage for successful C++ project management with guidance from The Cherno."
    },
    {
        embedSrc:"https://www.youtube.com/embed/rWuzbdmP8rI?si=eZLWpg1pxeV_DF7c",
        title:"Microsoft just gave up C/C++ (use Rust!)",
        description:"Big news! Microsoft just decided to go full force on Rust! What does this mean for Rust developers like you and me?"
    },
    {
        embedSrc:"https://www.youtube.com/embed/wMYWR-iNzdM?si=FB9MJaXYHdndwT5l",
        title:"Are Lists Evil? Creator Of C++ | Prime Reacts",
        description:"Uncover the intriguing debate: 'Are Lists Evil?' with insights from the creator of C++. Join Prime Reacts as they delve into the perspectives and considerations surrounding the use of lists in C++. Gain valuable insights into the nuances of this discussion straight from the mind behind C++."
    }],
    "Reactjs":[{
        embedSrc:"https://www.youtube.com/embed/FxgM9k1rg0Q?si=SG77w7_PnFxCbS8V",
        title:"Complete React course with projects | part 1",
        description:"Complete React course with projects | part 1"
    },
    {
        embedSrc: "https://www.youtube.com/embed/gbAdFfSdtQ4?si=FJKZUGgZ3hn-i9b9",
        title:"React JS Tutorial For Beginners With React JS Project Step By Step Tutorial 2023",
        description:"React JS Tutorial For Beginners With Project Step By Step Tutorial 2023 | Learn React JS and create To-Do List App react project in 1 hour."
    },
    {
        embedSrc:"https://www.youtube.com/embed/4UZrsTqkcW4?si=1vjMiIOiIpONHzYc" ,
        title:"Full React Course 2020 - Learn Fundamentals, Hooks, Context API, React Router, Custom Hooks",
        description:"Learn the basics of React in this comprehensive course. You will learn about fundamentals, hooks, context API, react router, custom hooks, and more.React is one of the most popular ways to build user interfaces using JavaScript."
    }],
    "Machine-Learning":[{
        embedSrc:"https://www.youtube.com/embed/hDKCxebp88A?si=UyIy6zlHFvesfFQ2",
        title:"Machine Learning with Python and Scikit-Learn – Full Course",
        description:"Embark on a hands-on Machine Learning journey with Aakash N S, Jovian's CEO. From Python basics to deploying models using Flask, this course covers it all. Build confidence in creating, training, and deploying real-world models. Aakash's expertise ensures practical skills, bridging theory with application for a transformative learning experience"
    },
    {
        embedSrc: "https://www.youtube.com/embed/k7ateFg6KN8?si=nY9S_b_HQ-yPNcG9",
        title:"Open Source Contribution End to End Machine Learning Projects In 2024",
        description:"Join Krish Naik in 2024 for a comprehensive guide to end-to-end machine learning projects through open source contributions. Explore the intricacies of contributing to open source, coupled with practical insights into building complete machine learning projects. Elevate your skills and actively contribute to the dynamic world of machine learning development."
    },
    {
        embedSrc:"https://www.youtube.com/embed/0Wi-fE7ijsg?si=TUzxyXbT0xO1QLTK" ,
        title:"How do AIs learn? Machine Learning explained in 2 minutes",
        description:"Machines possess incredible learning abilities, but how does it work? Can we harness this power for good, and what challenges does it pose? In a nutshell, here's machine learning explained in under two minutes – demystifying the magic behind machines that learn."
    }],
    "Data-Science":[{
        embedSrc:"https://www.youtube.com/embed/RBSUwFGa6Fk?si=B8D75OdusKWXx7jc" ,
        title:"What is Data Science?",
        description:"Data Science is the convergence of computer science, mathematics, and business expertise and helps entrepreneurs predict, diagnose, and solve their problems. Luv Aggarwal, a Data Solution Engineer at IBM, goes through the basics and explains how the discipline deploys data mining, data cleaning, machine learning and a variety of advanced analytics to yield actionable insights that will provide a roadmap for growth. "
    },
    {
        embedSrc:"https://www.youtube.com/embed/dcXqhMqhZUo?si=cbTK25m6FECuwsV9",
        title:"Data Analytics vs Data Science",
        description:"Curious about data science and puzzled by the distinction between data science and data analytics? Join Martin Keen in this video as he clarifies the difference. Though often used interchangeably, he delves into the unique roles, tools, and practices of data scientists and contrasts them with those of data analysts."
    },
    {
        embedSrc:"https://www.youtube.com/embed/ua-CiDNNj30?si=8w5h-8RNVsRCTQ-K",
        title:"Learn Data Science Tutorial - Full Course for Beginners",
        description:"Learn Data Science is this full tutorial course for absolute beginners. Data science is considered the sexiest job of the 21st century.You'll learn the important elements of data science. You'll be introduced to the principles, practices, and tools that make data science the powerful medium for critical insight in business and research. You'll have a solid foundation for future learning and applications in your work. With data science, you can do what you want to do, and do it better. This course covers the foundations of data science, data sourcing, coding, mathematics, and statistics."
    }]
}
function getlatestvideobytag(tag){
    return videoData[tag]||[];
}
// Assuming you have an array of channels
const channels = [
    {
        url: 'https://www.youtube.com/@LeadCodingbyFRAZ',
        image: 'https://yt3.googleusercontent.com/jq-CQjqGKJZ1RFb28PrRaYb26Dnsub8oYsIbsZr355Qfn0csdaDMxCZR_LpwiOHCd3lIUmzp_g=s176-c-k-c0x00ffffff-no-rj',
        date: 'Dec 5th 2021',
        readTime: '8',
        name: 'Fraz',
        description: 'Hello, I am Fraz. I am a Software Engineer at @Google. I have made this channel to help all who are ready to learn, grow, and do something big in the field of Tech. I create content through informational videos, tutorials, and podcasts that will help students and software engineers ace their coding interviews.',
    },
    {
        url: 'https://www.youtube.com/@IBMTechnology',
        image: 'https://yt3.googleusercontent.com/HHjrQZrBhfkuwgOkjzUJoWr1pteqnTro55ww253giS7A77VgkFeSZEWu0WFFUkzY2lf3vjzwhw=s176-c-k-c0x00ffffff-no-rj',
        date: 'Dec 5th 2021',
        readTime: '8',
        name: 'IBM Technology',
        description: 'Embark on a knowledge-rich journey with our educational content covering a spectrum of techs most significant domains. From AI, automation, and cybersecurity to data science, DevOps, quantum computing, and beyond, weve got you covered. Subscribe now to cultivate your skillset, stay updated on emerging trends, and glean insights from IBM experts. Whether youre a tech enthusiast or a seasoned professional, our content is designed to empower you in the ever-evolving landscape of technology. Join us on this educational adventure and stay ahead in the dynamic world of tech innovation',
    },
    {
        url: 'https://www.youtube.com/@NeetCode',
        image: 'https://yt3.googleusercontent.com/FqiGBOsNpeWbNw20ULboW0jy88JdpqFO9a-YRJ0C2oc4lZ8uoHYJ38PWSkrjdC_zQgNW9pGU=s176-c-k-c0x00ffffff-no-rj',
        date: 'Dec 5th 2021',
        readTime: '8',
        name: 'Neetcode',
        description: 'Current NEET and ex-Google SWE, also I love teaching!N.E.E.T. = (Not in education, employment or training)Preparing for coding interviews? Checkout neetcode.io',
    },
    {
        url: 'https://www.youtube.com/@AnujBhaiya',
        image: 'https://yt3.googleusercontent.com/ytc/APkrFKZUWKqafL5x24ulun2XXMwEeCpTL1xmlSU7kT92=s176-c-k-c0x00ffffff-no-rj',
        date: 'Dec 5th 2021',
        readTime: '8',
        name: 'Anuj Bhaiya',
        description: 'Hey, Whats up guys, Anuj here. Ex Software Engineer at Amazon & Urban Company and a self-taught programmer. I started this channel to teach you all the things I have learned, things I wish I had known sooner, and things to help you along the way. I ll teach you how to learn new Programming languages, help you understand Data Structures and Algorithms, and develop your soft skills. My goal is to provide you the best advice I can through tutorials so that you can crack the dream company you deserve.',
    },
    {
        url: 'https://www.youtube.com/@CodeHelp',
        image: 'assests/images/pimg/code-help channel.jpg',
        date: 'Dec 5th 2021',
        readTime: '8',
        name: 'Code Help',
        description: 'CodeHelp by Babbar is a popular coding community and YouTube channel created by love Babbar. Known for clear explanations and problem-solving techniques, it aids programmers in enhancing their coding skills through tutorials and engaging content..',
    },
    {
        url: 'https://www.youtube.com/@freecodecamp',
        image: 'assests/images/pimg/fcc channel.png',
        date: 'Dec 5th 2021',
        readTime: '8',
        name: 'FreeCodeCamp',
        description: 'FreeCodeCamp is a nonprofit offering free, hands-on coding challenges and courses. ...',
    }
];
const tagVideos = {
    "AI-ML": [
        {
            embedSrc: "https://www.youtube.com/embed/4RixMPF4xis?si=ZMMtnngPV6oRHu0I",
            title: "AI vs Machine Learning",
            description: "Description for AI ML Video 1",
        },
        {
            embedSrc: "https://www.youtube.com/embed/9dFhZFUkzuQ?si=JHVV3Zx9Wvs7ITaU",
            title: "Machine Learning vs Deep Learning vs Artificial Intelligence | ML vs DL vs AI | Simplilearn",
            description: "Description for AI ML Video 2",
        },
        // Add more videos for the "#AI ML" tag as needed
    ],
    "Data-Science": [
        {
            embedSrc: "https://www.youtube.com/embed/SJuR41tlE9k?si=KHNTKAJGiNwymIVi",
            title: " Data Science Full Course for Beginners 2023 | Learn Data Science in 12 Hours | Simplilearn",
            description: "Description for Data Science Video 1",
        },
        {
            embedSrc: "https://www.youtube.com/embed/N6BghzuFLIg?si=31YmjbX7e7k3Qflh",
            title: "Intro to Data Science - Crash Course for Beginners",
            description: "Description for Data Science Video 2",
        },
        // Add more videos for the "#Data Science" tag as needed
    ],
    "DSA": [{
        embedSrc:"https://www.youtube.com/embed/TgiY2GPrpf8?si=OSrmoC53uvU_bjk9",
        title:"Complete LIVE 6 months DSA Course with CP topics | Beginner to Advanced",
        description:"Embark on a comprehensive 6-month live Data Structures and Algorithms (DSA) course, covering Competitive Programming (CP) topics. Join Fraz on a journey from beginner to advanced proficiency. Elevate your coding skills, tackle complex problems, and master the art of efficient algorithmic solutions in real-time."
    },
    {
        embedSrc:"https://www.youtube.com/embed/9H_rX1vHuoM?si=G5dXBa06PJN5lmbe",
        title:"DSA v/s Development | What to do for Placements?",
        description:"Dive into the crucial decision of DSA vs. Development for successful placements in this insightful session by Shradha Di from Apna College. Gain valuable insights on which path to prioritize and strategize for a successful career launch. Make informed choices and set the foundation for a promising professional journey."
    }   // Add more videos for the "#DSA" tag as needed
    ],
    "webD": [
        {
            embedSrc:"https://www.youtube.com/embed/TgiY2GPrpf8?si=OSrmoC53uvU_bjk9",
            title:"Complete LIVE 6 months DSA Course with CP topics | Beginner to Advanced",
            description:"Embark on a comprehensive 6-month live Data Structures and Algorithms (DSA) course, covering Competitive Programming (CP) topics. Join Fraz on a journey from beginner to advanced proficiency. Elevate your coding skills, tackle complex problems, and master the art of efficient algorithmic solutions in real-time."
        },
        {
            embedSrc:"https://www.youtube.com/embed/9H_rX1vHuoM?si=G5dXBa06PJN5lmbe",
            title:"DSA v/s Development | What to do for Placements?",
            description:"Dive into the crucial decision of DSA vs. Development for successful placements in this insightful session by Shradha Di from Apna College. Gain valuable insights on which path to prioritize and strategize for a successful career launch. Make informed choices and set the foundation for a promising professional journey."
        } 
        // Add more videos for the "#WebD" tag as needed
    ],
    "AppD": [
        {
            embedSrc:"https://www.youtube.com/embed/TgiY2GPrpf8?si=OSrmoC53uvU_bjk9",
            title:"Complete LIVE 6 months DSA Course with CP topics | Beginner to Advanced",
            description:"Embark on a comprehensive 6-month live Data Structures and Algorithms (DSA) course, covering Competitive Programming (CP) topics. Join Fraz on a journey from beginner to advanced proficiency. Elevate your coding skills, tackle complex problems, and master the art of efficient algorithmic solutions in real-time."
        },
        {
            embedSrc:"https://www.youtube.com/embed/9H_rX1vHuoM?si=G5dXBa06PJN5lmbe",
            title:"DSA v/s Development | What to do for Placements?",
            description:"Dive into the crucial decision of DSA vs. Development for successful placements in this insightful session by Shradha Di from Apna College. Gain valuable insights on which path to prioritize and strategize for a successful career launch. Make informed choices and set the foundation for a promising professional journey."
        }
        // Add more videos for the "#AppD" tag as needed
    ],
    "C++": [
        {
            embedSrc:"https://www.youtube.com/embed/rWuzbdmP8rI?si=eZLWpg1pxeV_DF7c",
            title:"Microsoft just gave up C/C++ (use Rust!)",
            description:"Big news! Microsoft just decided to go full force on Rust! What does this mean for Rust developers like you and me?"
        },
        {
            embedSrc:"https://www.youtube.com/embed/wMYWR-iNzdM?si=FB9MJaXYHdndwT5l",
            title:"Are Lists Evil? Creator Of C++ | Prime Reacts",
            description:"Uncover the intriguing debate: 'Are Lists Evil?' with insights from the creator of C++. Join Prime Reacts as they delve into the perspectives and considerations surrounding the use of lists in C++. Gain valuable insights into the nuances of this discussion straight from the mind behind C++."
        }
        // Add more videos for the "#C++" tag as needed
    ],
    "Java": [
        {
            embedSrc: "https://www.youtube.com/embed/Java-Video1",
            title: "Java Video 1",
            description: "Description for Java Video 1",
        },
        {
            embedSrc: "https://www.youtube.com/embed/Java-Video2",
            title: "Java Video 2",
            description: "Description for Java Video 2",
        },
        // Add more videos for the "#Java" tag as needed
    ],
    "Python": [
        {
            embedSrc: "https://www.youtube.com/embed/Python-Video1",
            title: "Python Video 1",
            description: "Description for Python Video 1",
        },
        {
            embedSrc: "https://www.youtube.com/embed/Python-Video2",
            title: "Python Video 2",
            description: "Description for Python Video 2",
        },
        // Add more videos for the "#Python" tag as needed
    ],
    "DBMS": [
        {
            embedSrc: "https://www.youtube.com/embed/DBMS-Video1",
            title: "DBMS Video 1",
            description: "Description for DBMS Video 1",
        },
        {
            embedSrc: "https://www.youtube.com/embed/DBMS-Video2",
            title: "DBMS Video 2",
            description: "Description for DBMS Video 2",
        },
        // Add more videos for the "#DBMS" tag as needed
    ],
};
function getVideosByTag(tag) {
    return tagVideos[tag] || [];
}

/*function addFormDataToUserDetails(formData) {
    const email = formData.email;
    
    // Check if the email is not already in userdetails
    if (userdetails[email]) {
      console.log(`this ${email} already exists`);
      return 0 ;
    }
    userdetails[email]={};
    // Add form data to userdetails
    userdetails[email].firstname = formData.firstName;
    userdetails[email].lastName = formData.lastName;
    userdetails[email].college = formData.college;
    userdetails[email].course = formData.course;
    userdetails[email].password=formData.password;
    userdetails[email].preferredChannels=formData.preferredChannels;
    userdetails[email].preferredCourses=formData.preferredCourses; 
    userdetails[email].preferredTopics=formData.preferredTopics;
    userorder.push(email);
    return 1;
  }*/
   

// Function to add form data to user details
async function addFormDataToUserDetails(formData) {
  const email = formData.email;

  try {
    // Check if the email is not already in the database
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      console.log(`User with email ${email} already exists`);
      return 0;
    }

    // Add form data to the database
    await db.query(
      'INSERT INTO users (email, firstname, lastname, college, course, password, preferredChannels, preferredCourses, preferredTopics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        email,
        formData.firstName,
        formData.lastName,
        formData.college,
        formData.course,
        formData.password,
        formData.preferredChannels,
        formData.preferredCourses,
        formData.preferredTopics,
      ]
    );

    userorder.push(email);
    return 1;
  } catch (error) {
    console.error('Error adding user data:', error);
    return -1;
  }
}

  const userorder=[];
// Example usage:


// Render the EJS page with channel data
