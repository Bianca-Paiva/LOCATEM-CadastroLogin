const eyeBtn = document.querySelector(".eyeBtn");
const senha = document.getElementById("senha");

eyeBtn.addEventListener("click", () => {
    senha.type = senha.type === "password" ? "text" : "password";
    eyeBtn.classList.toggle("active");
});
