const savedMoviesDiv = document.getElementById("savedMovies");
const calculateBtn = document.getElementById("calculateBtn");
const totalDuration = document.getElementById("totalDuration");
const backBtn = document.getElementById("backBtn");

// Retrieve movies from Local Storage
let movies = [];

function loadMovies() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("mscMovies") || "[]"
        );

        movies = Array.isArray(saved) ? saved : [];

    } catch (error) {
        movies = [];
        alert("Unable to load saved movies.");
    }
}

// Save movies to Local Storage
function saveToStorage() {
    try {
        localStorage.setItem(
            "mscMovies",
            JSON.stringify(movies)
        );
        return true;
    } catch (error) {
        alert("Unable to save changes.");
        loadMovies();
        displayWatchlist();
        updateTotalDuration();
        return false;
    }
}

// READ: Display saved movies
function displayWatchlist() {
    savedMoviesDiv.innerHTML = "";

    if (movies.length === 0) {
        savedMoviesDiv.textContent =
            "Your watchlist is empty.";
        return;
    }

    movies.forEach((movie, index) => {
        const card = document.createElement("div");
        card.className = "movie-card";

        // Display movie poster
        if (movie.poster) {
            const poster = document.createElement("img");

            poster.src =
                `https://image.tmdb.org/t/p/w200${movie.poster}`;

            poster.alt = movie.title;
            card.appendChild(poster);
        }

        // Display movie title
        const title = document.createElement("h3");
        title.textContent = movie.title;

        // Display movie duration
        const duration = document.createElement("p");
        duration.textContent =
            `Duration: ${movie.duration} minutes`;

        // Display saved movie recommendation
        const recommendation = document.createElement("p");
        recommendation.className = "movie-suggestion";

        recommendation.textContent =
            movie.recommendation || "No recommendation saved";

        // Create status dropdown
        const status = document.createElement("select");

        const statuses = [
            "Plan to Watch",
            "Watching",
            "Watched"
        ];

        statuses.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            status.appendChild(option);
        });

        status.value = statuses.includes(movie.status)
            ? movie.status
            : "Plan to Watch";

        // Disable editing initially
        status.disabled = true;

        // UPDATE: Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";

        // UPDATE: Save Changes button
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save Changes";
        saveBtn.style.display = "none";

        // Enable editing
        editBtn.addEventListener("click", () => {
            status.disabled = false;

            editBtn.style.display = "none";
            saveBtn.style.display = "inline-block";

            status.focus();
        });

        // Save updated movie status
        saveBtn.addEventListener("click", () => {
            const newStatus = status.value;

            if (!statuses.includes(newStatus)) {
                alert("Please select a valid status.");
                return;
            }

            // Store old status in case saving fails
            const previousStatus = movies[index].status;
            movies[index].status = newStatus;

            if (!saveToStorage()) {
                status.value = previousStatus || "Plan to Watch";
                return;
            }

            status.disabled = true;

            editBtn.style.display = "inline-block";
            saveBtn.style.display = "none";

            alert("Movie updated successfully!");
        });

        // DELETE: Remove a movie
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {
            const confirmation = confirm(
                `Remove ${movie.title} from your watchlist?`
            );

            if (confirmation) {
                movies.splice(index, 1);

                if (saveToStorage()) {
                    displayWatchlist();
                    updateTotalDuration();
                    alert("Movie deleted successfully!");
                }
            }
        });

        // Display all movie information and buttons
        card.append(
            title,
            duration,
            recommendation,
            status,
            editBtn,
            saveBtn,
            deleteBtn
        );

        savedMoviesDiv.appendChild(card);
    });
}

// CALCULATION: Calculate total movie duration
function updateTotalDuration() {
    const totalMinutes = movies.reduce(
        (total, movie) => {
            const duration = Number(movie.duration);

            if (Number.isFinite(duration) && duration > 0) {
                return total + duration;
            }

            return total;
        },
        0
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    totalDuration.textContent =
        `Total Duration: ${hours} hours ${minutes} minutes`;
}

// Calculate when button is clicked
calculateBtn.addEventListener("click", () => {
    updateTotalDuration();
});

// NAVIGATION: Return to Movie Discovery
backBtn.addEventListener("click", () => {
    window.electronAPI.openDiscovery();
    window.close();
});

// Synchronize watchlist across windows
window.addEventListener("storage", (event) => {
    if (event.key === "mscMovies") {
        loadMovies();
        displayWatchlist();
        updateTotalDuration();
    }
});

// Display saved movies when window opens
loadMovies();
displayWatchlist();
updateTotalDuration();
