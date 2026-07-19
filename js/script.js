// 切換天數的 Tab (保持不變)
function openDay(evt, dayName) {
    let tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(dayName).style.display = "block";
    evt.currentTarget.className += " active";
}

let currentExercise = "";
// 定義過期時間 (毫秒)，這裡設定為 12 小時
const EXPIRE_TIME = 12 * 60 * 60 * 1000; 

// 打開彈出視窗
function openModal(exerciseName, imgSrc) {
    currentExercise = exerciseName;
    document.getElementById("modalTitle").innerText = exerciseName;
    document.getElementById("modalImg").src = imgSrc;

    // 1. 重量永遠保留 (不受時間影響)
    document.getElementById("modalWeight").value = localStorage.getItem(`weight_${exerciseName}`) || "";

    // 2. 檢查打勾狀態是否過期
    let savedTime = localStorage.getItem(`time_${exerciseName}`);
    let now = new Date().getTime();
    let isExpired = false;

    // 如果有存時間，且現在時間減去存檔時間大於 12 小時，判定為過期
    if (savedTime && (now - parseInt(savedTime) > EXPIRE_TIME)) {
        isExpired = true;
    }

    // 3. 根據是否過期，決定要顯示打勾還是清空
    for(let i = 1; i <= 5; i++) {
        if (isExpired) {
            // 過期：清空畫面上的打勾，並清除 LocalStorage 裡的舊紀錄
            document.getElementById(`modalSet${i}`).checked = false;
            localStorage.removeItem(`set${i}_${exerciseName}`);
        } else {
            // 沒過期：正常讀取之前的打勾狀態
            let isChecked = localStorage.getItem(`set${i}_${exerciseName}`) === "true";
            document.getElementById(`modalSet${i}`).checked = isChecked;
        }
    }
    
    // 如果過期了，順便把舊的時間戳記也清掉
    if (isExpired) {
         localStorage.removeItem(`time_${exerciseName}`);
    }

    document.getElementById("exerciseModal").style.display = "block";
}

function closeModal() {
    document.getElementById("exerciseModal").style.display = "none";
    currentExercise = "";
}

window.onclick = function(event) {
    let modal = document.getElementById("exerciseModal");
    if (event.target == modal) {
        closeModal();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 監聽重量輸入
    document.getElementById("modalWeight").addEventListener("input", (e) => {
        if(currentExercise) {
            localStorage.setItem(`weight_${currentExercise}`, e.target.value);
        }
    });

    // 監聽 5 個組數的打勾狀態
    for(let i = 1; i <= 5; i++) {
        document.getElementById(`modalSet${i}`).addEventListener("change", (e) => {
            if(currentExercise) {
                localStorage.setItem(`set${i}_${currentExercise}`, e.target.checked);
                // 關鍵：只要有更動打勾狀態，就更新當下的時間戳記
                localStorage.setItem(`time_${currentExercise}`, new Date().getTime());
            }
        });
    }
});

// 重置特定天數的所有紀錄 (保留按鈕以防萬一想手動清空)
function resetDay(dayId) {
    if(confirm("確定要重置這天的訓練紀錄嗎？（公斤數與打勾都會清空）")) {
        const dayContainer = document.getElementById(dayId);
        const exerciseTitles = dayContainer.querySelectorAll(".card h3");
        
        exerciseTitles.forEach(titleElement => {
            let exName = titleElement.innerText;
            localStorage.removeItem(`weight_${exName}`);
            localStorage.removeItem(`time_${exName}`);
            for(let i = 1; i <= 5; i++) {
                localStorage.removeItem(`set${i}_${exName}`);
            }
        });
        alert("該天紀錄已重置！");
    }
}