/**
 * Test the improved code formatting in JS-Kanji
 */

const decompressor = require('../js-kanji-decompressor');

const decompressedCode = `async function fetchUserData(userId) {
  try {
    const response = await fetch("https://api.example.com/users/" + userId, {
      headers: {
        "Authorization": "Bearer " + getAuthToken(),
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user: " + response.status);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    throw error;
  }
}

// Format and display user profile
function displayUserProfile(user) {
  const { name, email, role, lastLogin } = user;
  const formattedDate = new Date(lastLogin).toLocaleDateString();
  
  // Create profile elements
  const profileElements = {
    name: document.createElement("h2"),
    email: document.createElement("p"),
    role: document.createElement("p"),
    lastLogin: document.createElement("p")
  };
  
  // Set content for profile elements
  profileElements.name.textContent = name;
  profileElements.email.textContent = email;
  profileElements.role.textContent = "Role: " + role;
  profileElements.lastLogin.textContent = "Last login: " + formattedDate;
  
  // Append elements to container
  const container = document.getElementById("user-profile");
  Object.values(profileElements).forEach(element => {
    container.appendChild(element);
  });
  
  return container;
}`;

// Test the new formatting function
const formatted = decompressor.formatCode(decompressedCode);
console.log("\n=== FORMATTED CODE ===");
console.log(formatted);