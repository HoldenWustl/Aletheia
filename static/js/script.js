
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
const firebaseConfig = {
    apiKey: "AIzaSyCnrluY4qDFAON_1oTz3956MBB1vw0EuYM",
    authDomain: "aletheia-e0cd9.firebaseapp.com",
    projectId: "aletheia-e0cd9",
    storageBucket: "aletheia-e0cd9.firebasestorage.app",
    messagingSenderId: "320200865547",
    appId: "1:320200865547:web:0167d8c4904b838ea3140e",
    measurementId: "G-70X1VP7EE2"
  };
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
const auth = getAuth();
auth.signOut().catch((error) => {
    console.error("Error signing out:", error);
});

let loggedIn = false;
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const db = getFirestore();
const saveButton = document.getElementById("save-button");
const savedUrlsList = document.getElementById("saved-urls-list");


let currentUserId = null;

// Enable or disable the save button based on login status
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in
        loggedIn = true;
        currentUserId = user.uid;
        saveButton.disabled = false; // Enable the save button
        fetchSavedUrls(); // Fetch saved URLs when the user logs in
        console.log("User logged in:", user.email);
    } else {
        // User is logged out
        loggedIn = false;
        currentUserId = null;
        saveButton.disabled = true; // Disable the save button
        savedUrlsList.innerHTML = ""; // Clear saved URLs from the UI
        console.log("User logged out.");
    }
});

// Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Show logged-in message
        document.getElementById("user-email").textContent = user.email;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("logged-in-container").style.display = "block";
        loggedIn = true;
    } catch (error) {
        console.error("Login error:", error.message);

        if (error.code === "auth/user-not-found") {
            document.getElementById("login-error").textContent = "No account found with this email.";
        } else if (error.code === "auth/wrong-password") {
            document.getElementById("login-error").textContent = "Incorrect password.";
        } else {
            document.getElementById("login-error").textContent = "Error: " + error.message;
        }
    }
});

// Signup
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Show logged-in message
        document.getElementById("user-email").textContent = user.email;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("logged-in-container").style.display = "block";
        loggedIn = true;
    } catch (error) {
        console.error("Signup error:", error.message);
        document.getElementById("signup-error").textContent = "Error: " + error.message;
    }
});

// Logout
document.getElementById("logout-button").addEventListener("click", async () => {
    try {
        await auth.signOut();
        loggedIn = false;
        // Show login/signup forms
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("logged-in-container").style.display = "none";
    } catch (error) {
        console.error("Logout error:", error.message);
    }
});


document.getElementById("show-login").addEventListener("click", () => {
    // Show login form and hide signup form
    document.getElementById("login-form").style.display = "flex";
    document.getElementById("signup-form").style.display = "none";

    // Update active button style
    document.getElementById("show-login").classList.add("active");
    document.getElementById("show-signup").classList.remove("active");
});

document.getElementById("show-signup").addEventListener("click", () => {
    // Show signup form and hide login form
    document.getElementById("signup-form").style.display = "flex";
    document.getElementById("login-form").style.display = "none";

    // Update active button style
    document.getElementById("show-signup").classList.add("active");
    document.getElementById("show-login").classList.remove("active");
});


let authors, parsedUrl, title, website, formattedDate, summarySentences, topImage;
let isSummaryFirstDisplay = true;
let fadein = true;
const today = new Date();
const currentDate = today.toLocaleDateString('en-US', {
  year: 'numeric', // "2025"
  month: 'short', // "January"
  day: 'numeric' // "4"
});
const summaryContentElement = document.getElementById("summaryContent");
const backButton = document.getElementById("backButton");
const backButtonContainer = document.getElementById("back-button-container");
backButtonContainer.style.display = "none";
const urlForm = document.getElementById("urlForm");
const infoBoxes = document.getElementById("infoBoxes");
const sourceElement = document.getElementById("source");
const sourceImage = document.getElementById("sourceImage"); // Image element for source logo
const menu = document.getElementById('menu');
const meters = document.getElementById("meters");

backButton.addEventListener("click", function () {
    // Reset the display of elements
    infoBoxes.style.display = "none";
    menu.style.display = "none";
    document.getElementById("mainText").style.display = "none";
    document.getElementById("settingItems").style.display = "none";
    document.getElementById("summaryText").style.display = "none";
    document.getElementById("savedURLS").style.display = "none";
    if(!loggedIn){
    document.getElementById("auth-container").style.display = "block";}
    else{
        document.getElementById("logged-in-container").style.display = "block";
    }
    urlForm.reset(); // Reset the form inputs
    backButtonContainer.style.display = "none"; // Hide the back button itself
    document.getElementById("suggestedArticlesSection").style.display = "block";
});

document.getElementById("urlForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission reload

    const url = document.getElementById("articleUrl").value;
    
    menu.style.display = 'none';
    // Add the 'loading' class to the form
    urlForm.classList.add("loading");

    // Show loading spinner
    document.getElementById("loadingSpinner").style.display = 'flex';

    // Known sources mapping
    const knownSources = {
        "cnn.com": { name: "CNN", logo: "static/logos/cnn.svg", bias:-6.20, rel:42.10 },
        "bbc.com": { name: "BBC", logo: "static/logos/bbc.svg", bias:-1.35, rel:44.73 },
        "theguardian.com": { name: "The Guardian", logo: "static/logos/theguardian.svg", bias:-8.02 , rel:40.34},
        "nytimes.com": { name: "The New York Times", logo: "static/logos/nytimes.svg", bias: -8.08, rel:41.04 },
        "foxnews.com": { name: "Fox News", logo: "static/logos/foxnews.svg", bias: 11.07, rel: 35.37 },
        "washingtonpost.com": { name: "Washington Post", logo: "static/logos/thepost.png", bias: -6.85, rel: 38.84 },
        "apnews.com": { name: "Associated Press", logo: "static/logos/apnews.png", bias: -2.22, rel: 45.07 },
        "abcnews.go.com": { name: "ABC", logo: "static/logos/abcnews.png", bias: -3.00, rel: 44.80 },
        "axios.com": { name: "Axios", logo: "static/logos/axios.png", bias: -3.24, rel: 43.33 },
        "npr.org": { name: "NPR", logo: "static/logos/nprnews.svg", bias: -4.21, rel: 43.08 },
        "defense.gov": { name: "U.S Department of Defense", logo: "static/logos/defensenews.svg", bias: -0.25, rel: 46.15 },
        "nbcnews.com": { name: "NBC", logo: "static/logos/nbcnews.svg", bias: -5.81, rel: 43.69 },
        "euronews.com": { name: "Euronews", logo: "static/logos/euronews.svg", bias: -4.01, rel: 44.85 },
        "politico.com": { name: "Politico", logo: "static/logos/politico.svg", bias: -5.71, rel: 42.50 },
        // Add more sources as needed
    };
    
    try {
        // Extract and display the news source
        parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.replace('www.', ''); // Remove 'www.'
        let sourceData = knownSources[hostname];
        if (sourceData){
            website = sourceData.name;
            sourceElement.innerHTML = website + ' <i class="fas fa-check" style="color: green;"></i>';
        }
        if (!sourceData) {
            // Fallback: Format dynamically if not in known sources
            const baseName = hostname.split('.')[0]; // Get the first part before the dot
            const sourceName = baseName
                .split('-') // Split by hyphen if applicable
                .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
                .join('');
            sourceData = { name: sourceName, logo: null }; // Fallback without a logo
            website = sourceData.name;
            sourceElement.innerHTML = website;
        }

        // Update the source name and optional logo
        viewArticle(document.getElementById("viewArticleButton"));
        document.getElementById("citation").innerHTML = "Generate Citation";
        document.getElementById('factCheckContent').innerHTML = "Select One Sentence To Analyze.";
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("logged-in-container").style.display = "none";
        document.getElementById("suggestedArticlesSection").style.display = "none";
        if (sourceData.logo) {
            sourceImage.src = sourceData.logo;
            sourceImage.style.display = 'block';
        } else {
            sourceImage.style.display = 'none'; // Hide image if no logo is available
        }
        

        
        infoBoxes.style.display = 'flex';
        if (sourceData.bias) {
            meters.style.display = 'block'; // Show the meter
            
            updateIndicators(sourceData.bias,sourceData.rel);
            
            
        } else {
            meters.style.display = 'none'; // Hide if no bias data is available
        }
        // Make the fetch request to process the article
        const response = await fetch('https://aletheia-zl14.onrender.com/extract-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        // Handle non-OK responses
        if (!response.ok) {
            let errorMessage = 'Failed to process URL';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch {
                // If parsing fails, keep the generic error message
            }
            throw new Error(errorMessage);
        }
        menu.style.display = 'block';
        
        // Parse the valid JSON response and display the article text
        const data = await response.json();
        // Assuming you have an element with id "articleContent" in your HTML
        backButtonContainer.style.display = "flex";
        console.log(loggedIn);
        if(loggedIn){
            document.getElementById("status-text").style.display = "none";
        }
        else{
            document.getElementById("status-text").style.display = "block";
        }
        const articleContentElement = document.getElementById("articleContent");
        const articleAuthorElement = document.getElementById("author");
        const articleDateElement = document.getElementById("date");
        const articleTitleElement = document.getElementById("title1");
        const articleTitle2Element = document.getElementById("title2");
        
        // Clear any existing content before appending
        title = data.title;
        articleTitleElement.innerText = title;
        articleTitle2Element.innerText = title;
        const paragraphs = data.text;
        summarySentences = data.summary;
        topImage = data.image;
        // Insert paragraphs into the HTML
        if (fadein){
            articleContentElement.innerHTML = paragraphs.map(paragraph => `<p class="fade-in">${paragraph}</p>`).join('<br>');

            // Apply the fade-in effect with delay
            const fadeInParagraphs = document.querySelectorAll('.fade-in');
            fadeInParagraphs.forEach((para, index) => {
            para.style.setProperty('--delay', `${index * 0.1}s`);
            para.classList.add('fade-in-delayed');
            para.addEventListener('animationend', () => {
                para.classList.remove('fade-in');  // Remove fade-in class after the animation completes
                para.classList.remove('fade-in-delayed');
            });
            });
        }
        else {
            articleContentElement.innerHTML = paragraphs.map(paragraph => '<p>${paragraph}</p>').join('<br>');
        }
       
        summaryContentElement.innerHTML = summarySentences
            .map(sentence => `<p>${sentence}</p>`)
            .join('<br>');

        
        authors = data.authors;
        // Clean the author list by filtering out anything that seems like a URL or non-name data
        const cleanAuthors = authors.filter(author => author.includes(' '));

        // Join the clean authors into a single string, separated by commas
        const cleanAuthorsString = cleanAuthors.join(', ');
        articleAuthorElement.innerHTML = cleanAuthorsString;
        const publishDate = data.publish_date;
        const date = new Date(publishDate);
        formattedDate = date.toLocaleDateString('en-US', {
            month: 'short', // Short month (e.g., "Dec")
            day: 'numeric', // Day (e.g., "25")
            year: 'numeric' // Year (e.g., "2024")
        });
        articleDateElement.innerHTML = formattedDate;
        document.getElementById("mainText").style.display = 'flex';
       
    } catch (error) {
        document.getElementById("errorMessage").value = "Error: " + error.message;
        document.getElementById("errorMessage").style.display = 'block';
    } finally {
        // Remove the 'loading' class from the form
        urlForm.classList.remove("loading");

        // Hide loading spinner
        document.getElementById("loadingSpinner").style.display = 'none';
    }
});
document.querySelectorAll('.font-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove the 'active' class from all buttons
        document.querySelectorAll('.font-button').forEach(btn => btn.classList.remove('active'));

        // Add the 'active' class to the clicked button
        button.classList.add('active');
    });
});
document.querySelectorAll('.citation-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove the 'active' class from all buttons
        document.querySelectorAll('.citation-button').forEach(btn => btn.classList.remove('active'));

        // Add the 'active' class to the clicked button
        button.classList.add('active');
    });
});
function updateIndicators(biasScore,relScore) {
    const biasMeter = document.getElementById('biasMeter');
    const biasIndicator = document.getElementById('biasIndicator');
    const relMeter = document.getElementById('relMeter');
    const relIndicator = document.getElementById('relIndicator');
    // Debug: Check the meter width
    const spectrumWidth = biasMeter.offsetWidth;
    
    // Bias range (left -30, right +30)
    const biasRange = { left: -30, right: 30 };
    const relRange = {left: 0, right: 55};
    // Calculate the percentage based on the bias score
    const biasPositionPercentage = (biasScore - biasRange.left) / (biasRange.right - biasRange.left);
    const relPositionPercentage = (relScore - relRange.left) / (relRange.right - relRange.left);
    
    
    // Calculate the position of the indicator based on the percentage
    const biasPosition = biasPositionPercentage * spectrumWidth;
    const relPosition = relPositionPercentage * spectrumWidth;
    
    
    // Set the left position of the indicator (adjusted to center it)
    biasIndicator.style.left = `${biasPosition - biasIndicator.offsetWidth / 2}px`; // Ensure it is centered on the position
    relIndicator.style.left = `${relPosition - relIndicator.offsetWidth / 2}px`; // Ensure it is centered on the position
}

// Show the tooltip when hovering over the bias meter
document.getElementById("biasMeter").addEventListener("mouseenter", function() {
    document.getElementById("biasTooltip").style.display = "block";  // Show tooltip
});

// Hide the tooltip when mouse leaves the bias meter
document.getElementById("biasMeter").addEventListener("mouseleave", function() {
    document.getElementById("biasTooltip").style.display = "none";  // Hide tooltip
});

// Show the tooltip when hovering over the bias meter
document.getElementById("relMeter").addEventListener("mouseenter", function() {
    document.getElementById("relTooltip").style.display = "block";  // Show tooltip
});

// Hide the tooltip when mouse leaves the bias meter
document.getElementById("relMeter").addEventListener("mouseleave", function() {
    document.getElementById("relTooltip").style.display = "none";  // Hide tooltip
});

document.getElementById("summaryButton").addEventListener("click", (e) => viewSummary(e.target));
document.getElementById("savedButton").addEventListener("click", (e) => viewSaved(e.target));
document.getElementById("settingsButton").addEventListener("click", (e) => showSettings(e.target));
document.getElementById("viewArticleButton").addEventListener("click", (e) => viewArticle(e.target));
document.getElementById("arialButton").addEventListener("click", (e) => changeFont('Arial, sans-serif'));
document.getElementById("timesButton").addEventListener("click", (e) => changeFont('Times New Roman, serif'));
document.getElementById("sansButton").addEventListener("click", (e) => changeFont('Open Sans, sans-serif'));
document.getElementById("georgiaButton").addEventListener("click", (e) => changeFont('Georgia, serif'));
document.getElementById("mlaButton").addEventListener("click", (e) => generateCitation('MLA'));
document.getElementById("apaButton").addEventListener("click", (e) => generateCitation('APA'));
// Function to show article content
function viewArticle(button) {
    // Your logic for viewing the article
    
    setActiveButton(button);
    // Hide font options
    document.getElementById("mainText").style.display = "flex";
    document.getElementById("settingItems").style.display = "none";
    document.getElementById("summaryText").style.display = "none";
    document.getElementById("savedURLS").style.display = "none";
}

// Function to show font options
function showSettings(button) {
    setActiveButton(button);
    document.getElementById("mainText").style.display = "none";
    document.getElementById("summaryText").style.display = "none";
    document.getElementById("settingItems").style.display = "block";
    document.getElementById("savedURLS").style.display = "none";
}
function viewSaved(button) {
    setActiveButton(button);
    fetchSavedUrls();
    document.getElementById("mainText").style.display = "none";
    document.getElementById("summaryText").style.display = "none";
    document.getElementById("settingItems").style.display = "none";
    document.getElementById("savedURLS").style.display = "block";
}
function viewSummary(button){
    setActiveButton(button);
    document.getElementById("mainText").style.display = "none";
    document.getElementById("settingItems").style.display = "none";
    document.getElementById("summaryText").style.display = "block";
    document.getElementById("savedURLS").style.display = "none";
    summaryContentElement.innerHTML = "";
    if (fadein && isSummaryFirstDisplay) {
        // Set the summary content with fade-in class
        summaryContentElement.innerHTML = summarySentences
            .map(sentence => `<p class="fade-in">${sentence}</p>`)
            .join('<br>');

        // Apply the fade-in effect with delay
        const fadeInSummaryParagraphs = document.querySelectorAll('.fade-in');
        fadeInSummaryParagraphs.forEach((para, index) => {
            para.style.setProperty('--delay', `${index * 0.1}s`);
            para.classList.add('fade-in-delayed');

            // Remove the fade-in class after the animation ends
            para.addEventListener('animationend', () => {
                para.classList.remove('fade-in');  // Remove fade-in class after animation completes
                para.classList.remove('fade-in-delayed');  // Optionally remove delayed class if not needed
            });
        });

        // Set the flag to false after the first display
        isSummaryFirstDisplay = false;
    } else {
        // If not the first display, just update the content without animation
        summaryContentElement.innerHTML = summarySentences
            .map(sentence => `<p>${sentence}</p>`)
            .join('<br>');
    }
}
// Function to change the font
function changeFont(font) {
    document.body.style.fontFamily = font;
}

// Function to set the active button and remove the active class from others
function setActiveButton(button) {
    // Remove the active class from all buttons
    const buttons = document.querySelectorAll('.menu-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add the active class to the clicked button
    button.classList.add('active');
}

function generateCitation(format) {
    const citationContainer = document.getElementById("citation");
    if (format === "MLA") {
        // Generate MLA Citation
        const mlaCitation = `${authors}. "${title}." <i>${website}</i>, ${formattedDate}, ${parsedUrl}. Accessed ${currentDate}.`;
        citationContainer.innerHTML = mlaCitation;
    } else if (format === "APA") {
        // Generate APA Citation
        const apaCitation = `${authors}. (${formattedDate}). ${title}. <i>${website}</i>. ${parsedUrl}`;
        citationContainer.innerHTML = apaCitation;
    }
}

async function sendSentenceToBackend(sentence) {
    const loadingInterval = setLoadingMessage();
    try {
      const response = await fetch('https://aletheia-zl14.onrender.com/process-sentence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentence }), // Send the sentence as JSON
      });
  
      if (response.ok) {
        const data = await response.json(); // Parse the JSON response
        console.log(data);
        // Assuming 'data' contains your API response
        const factCheckContent = document.getElementById("factCheckContent");
        const evidences = data.results.claim_detail[0].evidences;
        
        // Utility function to clean up text
        function cleanText(text) {
          return text.replace(/\s+/g, " ").trim(); // Replace multiple spaces with one and trim
        }
        
        // Clear existing content
        factCheckContent.innerHTML = "";
        
        // Loop through each evidence and create a formatted block
        evidences.forEach((evidence) => {
          const evidenceBlock = document.createElement("div");
          evidenceBlock.classList.add("fact-check-item");
        
          // Add the claim
          const claim = document.createElement("h4");
          claim.innerText = `Claim: ${cleanText(evidence.claim)}`;
          evidenceBlock.appendChild(claim);
        
          // Add the evidence URL
          const evidenceLink = document.createElement("p");
          evidenceLink.innerHTML = `Evidence: <a href="${evidence.url}" target="_blank">${cleanText(evidence.url)}</a>`;
          evidenceBlock.appendChild(evidenceLink);
        
          // Add the relationship
          const relationship = document.createElement("p");
          relationship.innerHTML = `Relationship: <span class="relationship">${cleanText(evidence.relationship)}</span>`;
          evidenceBlock.appendChild(relationship);
        
          // Add the explanation
          const explanation = document.createElement("p");
          explanation.innerText = `Explanation: ${cleanText(evidence.text)}`;
          evidenceBlock.appendChild(explanation);
        
          // Append the block to the container
          factCheckContent.appendChild(evidenceBlock);
        });
        

        // Handle the response (e.g., display it on the page)
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    finally {
        // Stop the loading animation
        clearInterval(loadingInterval);
      }
  }

  function setLoadingMessage() {
    const factCheckContent = document.getElementById('factCheckContent');
    let dots = 1;
  
    const interval = setInterval(() => {
      factCheckContent.innerText = 'Analyzing text' + '.'.repeat(dots);
      dots = (dots % 3) + 1; // Toggle between 1, 2, and 3 dots
    }, 500);
  
    return interval;
  }

let lastSelectedSentence = '';
// Event listener for mouseup event
function getCompleteSentence(selection) {
    const sentenceRegex = /([A-Z][^.!?]*?(?:\.\s|[.!?]))/g;
    const matches = selection.match(sentenceRegex);
  
    if (matches && matches.length === 1) {
      return matches[0]; // If exactly one complete sentence is selected
    }
    return null;
  }

document.getElementById("articleContent").addEventListener("mouseup", () => {
    const selection = window.getSelection().toString().trim();
  
    // If selection exists and is a complete sentence
    if (selection) {
      const selectedSentence = getCompleteSentence(selection);
  
      if (selectedSentence && (selectedSentence !== lastSelectedSentence)) {
        console.log("Selected Sentence:", selectedSentence);
  
        // Send the sentence to the backend
        sendSentenceToBackend(selectedSentence);
        lastSelectedSentence = selectedSentence;
      } else {
        console.log("Please select only one complete sentence.");
      }
    }
  });




// Save the current URL to Firestore
saveButton.addEventListener("click", async () => {
    if (!loggedIn) return;

    const currentUrl = typeof parsedUrl === "object" ? parsedUrl.href : parsedUrl;
    const imageUrl = topImage // Implement a function to fetch image URL for the article

    if (!currentUrl) {
        alert("No URL entered!");
        return;
    }

    try {
        const userDocRef = doc(db, "users", currentUserId);

        // Save URL and image URL to Firestore
        await updateDoc(userDocRef, {
            savedUrls: arrayUnion({ url: currentUrl, image: imageUrl }),
        });

        alert("URL and image saved!");
        displaySavedUrls([{ url: currentUrl, image: imageUrl }]); // Update the UI with both URL and image
    } catch (error) {
        if (error.code === "not-found") {
            await setDoc(doc(db, "users", currentUserId), {
                savedUrls: [{ url: currentUrl, image: imageUrl }],
            });
            alert("URL and image saved!");
            displaySavedUrls([{ url: currentUrl, image: imageUrl }]); // Update the UI
        } else {
            console.error("Error saving URL and image:", error);
        }
    }
});


async function fetchSavedUrls() {
    try {
        const userDocRef = doc(db, "users", currentUserId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const savedUrls = userDoc.data().savedUrls || [];
            displaySavedUrls(savedUrls);
        }
    } catch (error) {
        console.error("Error fetching saved URLs:", error);
    }
}



function displaySavedUrls(savedUrls) {
    savedUrlsList.innerHTML = ""; // Clear the list before adding new entries
    document.getElementById("savedArticlesCount").textContent = `(${savedUrls.length})`;
    savedUrls.forEach((article, index) => {
        const { url, image } = article;

        // Create a container for the article
        const articleContainer = document.createElement("div");
        articleContainer.className = "article-container";

        // Create the image element
        const imgElement = document.createElement("img");
        imgElement.src = image;
        imgElement.alt = "Article Image";
        imgElement.className = "article-image";

        // Create the URL text element
        const urlElement = document.createElement("span");
        urlElement.textContent = url;
        urlElement.className = "article-url";

        // Create the copy button
        const copyButton = document.createElement("button");
        copyButton.className = "copy-button";
        copyButton.innerHTML = "&#128203;"; // Copy icon
        copyButton.title = "Copy to clipboard";
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(url);
            alert("URL copied to clipboard!");
        });

        // Create the delete button (red X)
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.innerHTML = "&#10006;"; // Red X icon
        deleteButton.title = "Delete URL";
        
        // Add event listener to delete button
        deleteButton.addEventListener("click", async () => {
            try {
                // Remove the article from Firebase
                const userDocRef = doc(db, "users", currentUserId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const savedUrls = userDoc.data().savedUrls || [];
                    savedUrls.splice(index, 1); // Remove the URL from the array
                    await updateDoc(userDocRef, { savedUrls }); // Update Firebase

                    // Remove the article from the UI
                    savedUrlsList.removeChild(articleContainer);
                    alert("URL deleted!");
                }
            } catch (error) {
                console.error("Error deleting URL:", error);
            }
        });

        // Append elements to the article container
        articleContainer.appendChild(imgElement);
        articleContainer.appendChild(urlElement);
        articleContainer.appendChild(copyButton);
        articleContainer.appendChild(deleteButton); // Add delete button

        // Append the article container to the saved URLs list
        savedUrlsList.appendChild(articleContainer);
    });
}



// Function to fetch suggested articles from the backend
// Function to fetch suggested articles from the backend
async function fetchSuggestedArticles(topic = "WORLD") {
    try {
        document.getElementById("loadingSuggested").style.display = "flex";

        // Fetch the list of suggested URLs for the selected topic
        const response = await fetch(`/suggested-articles?topic=${topic}`);
        const suggestedUrls = await response.json();

        // Fetch images for each URL
        const suggestedArticles = await Promise.all(
            suggestedUrls.map(async (url) => {
                const imageResponse = await fetch("/extract-article", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ url }),
                });

                const { image } = await imageResponse.json();

                // Default to 'static/default_news.jpg' if no image is found
                const imageUrl = image && image !== '' ? image : '/static/default_news.jpg';

                return { url, image: imageUrl };
            })
        );

        // Hide loading spinner
        document.getElementById("loadingSuggested").style.display = "none";

        // Return fetched articles
        return suggestedArticles;
    } catch (error) {
        console.error("Error fetching suggested articles:", error);
        document.getElementById("loadingSuggested").style.display = "none";
        return []; // Return an empty array to avoid undefined errors
    }
}



// Get references to dropdown and articles list
const topicSelector = document.getElementById("topicSelector");
const suggestedArticlesList = document.getElementById("suggestedArticlesList");
const loadingSuggested = document.getElementById("loadingSuggested");

// Event listener for dropdown menu
topicSelector.addEventListener("change", async (event) => {
    const selectedTopic = event.target.value.toUpperCase();

    // Show loading spinner
    loadingSuggested.style.display = "block";

    try {
        // Fetch articles based on the selected topic
        const articles = await fetchSuggestedArticles(selectedTopic);
        displaySuggestedArticles(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        suggestedArticlesList.innerHTML = "<p>Failed to load articles. Please try again later.</p>";
    } finally {
        // Hide loading spinner
        loadingSuggested.style.display = "none";
    }
});

// Function to display suggested articles
// Function to display suggested articles
function displaySuggestedArticles(articles) {

    suggestedArticlesList.innerHTML = ""; // Clear previous content

    articles.forEach(({ url, image }) => {
        // Create article container
        const articleContainer = document.createElement("div");
        articleContainer.className = "article-container";

        // Create image element
        const imgElement = document.createElement("img");
        imgElement.src = image;
        imgElement.alt = "Suggested Article Image";
        imgElement.className = "article-image";

        // Create URL link element
        const urlElement = document.createElement("a");
        urlElement.href = url;
        urlElement.target = "_blank"; // Open in a new tab
        urlElement.textContent = url; // Set the text content as the URL
        urlElement.className = "article-url"; // Add CSS class for styling

        // Create copy button
        const copyButton = document.createElement("button");
        copyButton.className = "copy-button";
        copyButton.innerHTML = "&#128203;"; // Copy icon
        copyButton.title = "Copy to clipboard";
        copyButton.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering the link click when copying
            navigator.clipboard.writeText(url);
            alert("URL copied to clipboard!");
        });

        // Append elements to article container
        articleContainer.appendChild(imgElement);
        articleContainer.appendChild(urlElement);
        articleContainer.appendChild(copyButton);

        // Append article container to the list
        suggestedArticlesList.appendChild(articleContainer);
    });
}


(async () => {
    const articles = await fetchSuggestedArticles();
    displaySuggestedArticles(articles);
})();
