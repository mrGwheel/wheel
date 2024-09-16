const wheelCanvas = document.getElementById("wheelCanvas");
const namesInput = document.getElementById("namesInput");
const spinButton = document.getElementById("spinButton");

// Function to update chart font size based on screen width
const updateChartFontSize = () => {
  let fontSize;

  // Adjust font size based on screen width (media query-like behavior)
  if (window.innerWidth < 500) {
    fontSize = 16; // Small screens (mobile)
  } else if (window.innerWidth < 1000) {
    fontSize = 20; // Medium screens (tablets)
  } else {
    fontSize = 28; // Large screens (desktops)
  }

  // Update chart options for legend and datalabels
  myChart.options.plugins.legend.labels.font.size = fontSize;
  myChart.options.plugins.datalabels.font.size = fontSize;

  // Update the chart to apply changes
  myChart.update();
};

// Function to handle input and restrict to only letters and numbers
const filterInput = (inputText) => {
  // Use a regular expression to allow only letters (a-z, A-Z) and numbers (0-9)
  return inputText.replace(/[^a-zA-Z0-9\s]/g, ""); // Replace all non-alphanumeric characters
};

// Handle input event to update names and chart
namesInput.addEventListener("input", (event) => {
  let inputText = event.target.value;

  // Filter out invalid characters
  inputText = filterInput(inputText);

  // Update the names array and chart with valid input
  names = inputText
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map(capitalizeFirstLetter); // Capitalize each name

  // Update the textarea value with the filtered input
  namesInput.value = inputText;

  updateChart();
});

// Register the plugin to all charts
Chart.register(ChartDataLabels);

// Create initial chart
let myChart = new Chart(wheelCanvas, {
  type: "pie",
  data: {
    labels: [], // Populate your labels here
    datasets: [
      {
        backgroundColor: [], // Populate your background colors here
        data: [], // Populate your data here
      },
    ],
  },
  options: {
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      tooltip: false,
      legend: {
        labels: { font: { size: 28, weight: "lighter" } }, // Default font size, updated dynamically
        display: false,
      },
      datalabels: {
        color: "#fdfdfd",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: 24, family: "Montserrat, sans-serif" }, // This will also be updated dynamically
        anchor: "end",
        align: "start",
        offset: 10,
        rotation: (context) => {
          const totalAngle = context.chart.data.datasets[0].data.reduce(
            (acc, value) => acc + value,
            0
          );
          const value = context.chart.data.datasets[0].data[context.dataIndex];
          const sliceAngle = (value / totalAngle) * 360;
          const startAngle =
            context.chart.getDatasetMeta(0).data[context.dataIndex].startAngle *
            (180 / Math.PI);
          const middleAngle = startAngle + sliceAngle / 2;
          return middleAngle;
        },
      },
    },
    rotation: 0, // Initialize rotation option
  },
});

// Initially update the chart font size AFTER the chart is initialized
updateChartFontSize();

// Add an event listener to handle screen resizing
window.addEventListener("resize", updateChartFontSize);

// Function to update the chart with new names

const updateChart = () => {
  // Clean up names
  const cleanedNames = names
    .map((name) => name.trim()) // Trim spaces
    .filter((name) => name.length > 0); // Remove empty names

  myChart.data.labels = cleanedNames;
  myChart.data.datasets[0].data = new Array(cleanedNames.length).fill(
    100 / cleanedNames.length
  ); // Equal distribution
  myChart.data.datasets[0].backgroundColor = generateColors(
    cleanedNames.length
  );

  myChart.update();
};

// Declare the colorPalette globally
let colorPalette = ["#8b35bc", "#b163da"]; // Default purple colors

// Function to generate background colors for the chart
const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(colorPalette[i % colorPalette.length]);
  }
  return colors;
};

// Get the toggle switch and body element
const themeSwitch = document.getElementById("themeSwitch");
const body = document.body;

// Add an event listener to detect changes
themeSwitch.addEventListener("change", () => {
  // Only apply transition during theme switch
  if (themeSwitch.checked) {
    // Apply punish round styles by adding a class to the body
    body.classList.add("punish-mode");

    // Change color palette to red shades
    colorPalette = ["#f22d3d", "#f45663"]; // Red shades for punish round

    // Enable smooth chart color transition
    myChart.options.animation = {
      duration: 1000, // 1 second transition
      easing: "easeOutQuad", // Smooth easing
    };
  } else {
    // Remove the class to revert back to normal mode
    body.classList.remove("punish-mode");

    // Revert to default purple color palette
    colorPalette = ["#8b35bc", "#b163da"];

    // Enable smooth chart color transition
    myChart.options.animation = {
      duration: 1000, // 1 second transition
      easing: "easeOutQuad",
    };
  }

  // Update the chart with new colors
  updateChart();

  // Disable the animation after the theme switch to prevent it on other updates
  setTimeout(() => {
    myChart.options.animation = { duration: 0 }; // Disable animation for other updates
  }, 1000); // Matches the animation duration
});

// Function to capitalize the first letter of each word
const capitalizeFirstLetter = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Handle input event to update names and chart
namesInput.addEventListener("input", (event) => {
  const inputText = event.target.value;
  names = inputText
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map(capitalizeFirstLetter); // Capitalize each name
  updateChart();
});

// Spinning logic

spinButton.addEventListener("click", () => {
  spinButton.disabled = true;

  // Total spin duration in milliseconds
  const duration = 5000;

  // Randomize the final angle where the wheel stops (anywhere between 0 to 360 degrees)
  const randomDegree = Math.floor(Math.random() * 360);

  // Start at the current rotation
  let currentRotation = myChart.options.rotation || 0;

  // Target rotation is the current rotation plus a few extra spins and the random angle
  const totalRotation = currentRotation + 360 * 5 + randomDegree;

  // Timestamp for the start of the spin
  const startTime = performance.now();

  // Animation loop
  const spin = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1); // Normalize progress between 0 and 1

    // Ease out function for smooth deceleration
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Calculate the current rotation based on eased progress
    myChart.options.rotation =
      currentRotation + easedProgress * (totalRotation - currentRotation);

    myChart.update();

    // If animation is still in progress, request the next frame
    if (progress < 1) {
      requestAnimationFrame(spin);
    } else {
      // Animation is complete, calculate the winner based on the final rotation
      const finalRotation = myChart.options.rotation % 360; // Normalize final rotation within 0-360
      determineWinner(finalRotation);
      spinButton.disabled = false;
    }
  };

  requestAnimationFrame(spin);
});

// Function to determine the winner based on the final rotation
const determineWinner = (finalRotation) => {
  const segments = myChart.data.labels.length;
  const segmentAngle = 360 / segments; // Recalculate based on the updated number of segments

  // We want to find which segment is facing the exact 90-degree mark
  const targetAngle = (90 - finalRotation + 360) % 360; // Correct for rotation, targeting the 90 degrees

  let cumulativeAngle = 0;
  let winnerIndex = null;

  for (let i = 0; i < segments; i++) {
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + segmentAngle;

    // Check if the target angle falls within the current segment's arc
    if (targetAngle >= startAngle && targetAngle < endAngle) {
      winnerIndex = i;
      break;
    }

    cumulativeAngle += segmentAngle;
  }

  // Log or display the winner if found
  if (winnerIndex !== null) {
    const winner = myChart.data.labels[winnerIndex];
    console.log(`Winner: ${winner}`);
    const modal = document.getElementById("winnerModal");
    const winnerName = document.getElementById("winnerName");
    winnerName.textContent = `${winner}!`;
    setTimeout(() => {
      modal.style.display = "block";
    }, 500);

    // Optional: Hide after a few seconds
    /*setTimeout(() => {
      modal.style.display = "none";
    }, 3000);*/
  } else {
    console.log("No winner found, check logic");
  }
};

// Close the modal when the modalButton is clicked
const modalButton = document.getElementById("modalButton");
modalButton.addEventListener("click", () => {
  const modal = document.getElementById("winnerModal");
  modal.style.display = "none";
});

// Get the toggle switch and body element
//const themeSwitch = document.getElementById("themeSwitch");
//const body = document.body;

// Add an event listener to detect changes
themeSwitch.addEventListener("change", () => {
  if (themeSwitch.checked) {
    // Apply punish round styles by adding a class to the body
    body.classList.add("punish-mode");
  } else {
    // Remove the class to revert back to normal mode
    body.classList.remove("punish-mode");
  }
});
