/*HTML에서 넘어오는 값들*/
let table1 = document.querySelector(".insert_table"); // 프로세스 정보를 입력받는 테이블 table1
// insert_value라는 이름을 가진 클래스를 찾음
let table2 = document.querySelector(".output_table"); // 프로세스에서 WT, TT, NTT 포함해서 전부 보여주는 테이블 table2
// output_talble라는 이름을 가진 클래스를 찾아서 table2에 반환
let table3 = document.querySelector(".visual_table"); // 프로세스가 실행되는 순서를 표시해 주는 테이블 table3
// visual이라는 이름을 가진 클래스를 찾아서 table3에 반환
const button = document.getElementById("btn_addRow"); // add row 버튼 눌렀을때 표에 저장
const button_start = document.getElementById("btn_simulate"); // simulate 버튼 눌렀을 때, table2, table3 출력
const rr = document.querySelector("#rr"); // radio에서 RoundRobin 선택했을때 
const timeQuantumInput = document.querySelector("#timeQuantum-input"); // RoundRobin을 실행하기 위해 넘어온 timeQuantum
var pName = document.getElementById("pName"); // 처음에 프로세스 이름 입력받으면 여기로 넘어옴
var pArrivalTime = document.getElementById("pArrivalTime"); // 처음에 프로세스 AT 입력받으면 여기로 넘어옴
var pBurstTime = document.getElementById("pBurstTime"); // 처음에 프로세스 BT 입력받으면 여기로 넘어옴

/*프로세스 스케줄링을 위한 변수들*/
var index = 0; // 표를 출력할 index
let k = 0; // 프로세서가 프로세스를 처리하는 일련의 과정을 보여주기 위한 time배열의 인덱스
var pArray = Array.from(Array(15), () => new Array(2)); // 15개의 행을 가진 2차원 배열 생성 -> arr[15][2]
var spnArray = Array.from(Array(15), () => new Array(2)); // 15개의 행을 가진 2차원 배열 생성 -> arr[15][2]
var pArray_copy = Array.from(Array(15), () => new Array(2)); // 15개의 행을 가진 2차원 배열 생성 -> arr[15][2]
var pWaitingTime = Array.from({ length: 15 }, () => 0); // 15의 크기를 가진 WT를 나타내는 배열, 0으로 전부 초기화
var pTurnAroundTime = new Array(15); // 15의 크기를 가진 TT를 나타내는 배열, 10개의 자리에는 아무것도 들어있지 않음
var pNormalizedTT = new Array(15); // 15의 크기를 가진 NTT를 나타내는 배열, 10개의 자리에는 아무것도 들어있지 않음
var time = new Array(1000); // 프로세서가 프로세스를 처리하는 일련의 과정을 보여주기 위한 배열
var selectedAlgorithm; // 선택된 알고리즘
var totalTime = 0; // 모든 프로세스의 BurstTime을 다 더한 totalTime
var timeQuantum; // 사용자로부터 입력받은 timeQuantum

let row1 = table3.insertRow(0);
let row2 = table3.insertRow(1);
var z = 0;

class Queue { // 큐 클래스
    constructor() { // 클래스 변수 선언
        this._arr = []; // 배열
    }
    enqueue(item) { // 배열에 item 항목 삽임
        this._arr.push(item);
    }
    dequeue() { // 배열에서 항목 빼기
        return this._arr.shift();
    }
    isEmpty() { // 큐가 비어있는지 판단
        return this._arr.length === 0;
    }
}

const q = new Queue(); // RoundRobin에서 사용하기 위한 큐 객체 생성
const s = new Set(); // SPN에서 사용하기 위한 집합 객체 생성

function getTotalTime() { // 전체 프로세스의 Burst Time을 추출하는 함수
    for (var i = 0; i < index; i++) { //입력받은 프로세스들의 수만큼 반복
        totalTime += Number(pArray[i][2]); // 모든 프로세스의 Burst Time 추출해서 totalTime을 더함
    }
}

function addToQueue() { // AT를 기준으로해서 q에 삽입
    for (let i = 0; i < totalTime; i++) { // totalTime만큼 반복 
        for (let j = 0; j < index; j++) { // 프로세스의 갯수만큼 반복 
            if (i === Number(pArray[j][1])) { // 흐르는 시간이 프로세스의 AT와 일치하면
                q.enqueue(pArray[j]); // 큐에 해당 프로세스의 정보를 삽입
                break;
            }
        }
    }
}

function getProcessor() { // FCFS를 실행하는 함수
    for (let j = 0; j < index; j++) { // 프로세스의 갯수만큼 실행
        let x = q.dequeue(); // 큐에서 항목을 꺼내
        for (let i = 0; i < x[2]; i++) { // 꺼낸 프로세스의 BT만큼
            time[k] = x[0]; // 프로세서에서 변화없이 프로세스를 실행
            k++; // 프로세스를 실행한 시간 증가
        }
    }
}

function addToQueue_rr() { // Round Robin에서 사용할 큐에 프로세스들을 삽입
    for (var i = 0; i < totalTime; i++) { // totalTime만큼 반복
        for (var j = index - 1; j >= 0; j--) {
            if (i === pArray_copy[j][1]) {
                q.enqueue(pArray_copy[j]);
                run();
            }
        }
    }
}

function run() {
    let remainBT
    while (!q.isEmpty()) {
        x = q.dequeue();
        remainBT = x[2];
        let p = Number(k);
        if (remainBT < timeQuantum) {
            for (var j = 0; j < x[2]; j++) {
                time[k] = x[0];
                remainBT--;
                k++;
            }
        } else {
            for (var j = 0; j < timeQuantum; j++) {
                time[k] = x[0];
                remainBT--;
                k++;
            }
        }
        if (remainBT > 0) {
            for (var i = 0; i < index; i++) {
                if (x[0] == pArray_copy[i][0]) {
                    pArray_copy[i][1] = p + timeQuantum;
                    pArray_copy[i][2] = remainBT;
                }
            }
        }
    }
}

function addToSet_spn() { // SPN을 실행하기 위해 집합 s에 프로세스들을 삽입
    for (let i = 0; i < index; i++) { // 프로세스의 갯수만큼 반복
        s.add(pArray[i][0]); // 프로세스의 이름들만 삽입
    }
}

function getProcess_spn() { // SPN을 실행시키는 함수
    for (let i = 0; i < totalTime;) { //전체실행시간만큼 반복하는데 바로 증감하지 않음
        let min_bt = totalTime; // 전체 실행시간수를 최소 BT로 초기화
        let minidx; // BT의 값이 가장 작은 인덱스
        for (j = 0; j < index; j++) { // 프로세스의 수만큼 반복 
            if ((s.has(pArray[j][0])) && (pArray[j][2] < min_bt) && (i >= pArray[j][1])) {
                //해당 프로세스가 집합에 있고 / 해당 프로세스의 BT가 최소 BT보다 작으며 / 해당 프로세스의 도착 시간이 현재 시간이전에 도착했으면
                min_bt = pArray[j][2]; // 최소 BT의 값은 해당 프로세스의 BT
                minidx = Number(j); // BT의 값이 가장 작은 인덱스는 해당 프로세스의 위치
            }
        }
        s.delete(pArray[minidx][0]); // BT가 작았던 프로세스를 집합에서 꺼냄
        for (let t = 0; t < pArray[minidx][2]; t++) { // 위 프로세스의 BT만큼
            time[k] = pArray[minidx][0]; // 프로세서에서 프로세스를 실행
            k++; // 프로세서에서 프로세스를 실행하는 시간 증가
            i++; // 현재 시간 증가
        }
    }
}

function getOutputTable() { // 마지막 전체 결과 테이블을 출력하는 함수
    for (var i = 0; i < 20; i++) { // 전체 실행 시간중에서 반복
        if (time[i] === pArray[0][0]) { // 프로세스의 TurnAroundTime을 계산
            pTurnAroundTime[0] = Number(i + 1);
        }
        if (time[i] === pArray[1][0]) {
            pTurnAroundTime[1] = Number(i + 1);
        }
        if (time[i] === pArray[2][0]) {
            pTurnAroundTime[2] = Number(i + 1);
        }
        if (time[i] === pArray[3][0]) {
            pTurnAroundTime[3] = Number(i + 1);
        }
        if (time[i] === pArray[4][0]) {
            pTurnAroundTime[4] = Number(i + 1);
        }
        if (time[i] === pArray[5][0]) {
            pTurnAroundTime[5] = Number(i + 1);
        }
        if (time[i] === pArray[6][0]) {
            pTurnAroundTime[6] = Number(i + 1);
        }
        if (time[i] === pArray[7][0]) {
            pTurnAroundTime[7] = Number(i + 1);
        }
        if (time[i] === pArray[8][0]) {
            pTurnAroundTime[8] = Number(i + 1);
        }
        if (time[i] === pArray[9][0]) {
            pTurnAroundTime[9] = Number(i + 1);
        }
        if (time[i] === pArray[10][0]) {
            pTurnAroundTime[10] = Number(i + 1);
        }
        if (time[i] === pArray[11][0]) {
            pTurnAroundTime[11] = Number(i + 1);
        }
        if (time[i] === pArray[12][0]) {
            pTurnAroundTime[12] = Number(i + 1);
        }
        if (time[i] === pArray[13][0]) {
            pTurnAroundTime[13] = Number(i + 1);
        }
        if (time[i] === pArray[14][0]) {
            pTurnAroundTime[14] = Number(i + 1);
        }
    }
    for (var i = 0; i < index; i++) {
        pWaitingTime[i] = pTurnAroundTime[i] - pArray[i][1] - pArray[i][2]; // 프로세스의 WaitingTime 계산
        pTurnAroundTime[i] = pWaitingTime[i] + pArray[i][2]; // 프로세스의 TT=WT+BT
        pNormalizedTT[i] = pTurnAroundTime[i] / pArray[i][2]; // 프로세스의 NTT=TT/BT
    }
}

function addRow() { // 사용자로부터 프로세스의 정보들을 입력받음
    let row = table1.insertRow(index + 1);
    let cell1 = row.insertCell(0);
    let text1 = document.createTextNode(pName.value);
    let cell2 = row.insertCell(1);
    let text2 = document.createTextNode(pArrivalTime.value);
    let cell3 = row.insertCell(2);
    let text3 = document.createTextNode(pBurstTime.value);
    cell1.appendChild(text1);
    cell2.appendChild(text2);
    cell3.appendChild(text3);
    pArray[index][0] = pName.value; // FCFS, SPN에서 사용하는 pArray의 0번째 항목에 이름을 입력
    pArray[index][1] = Number(pArrivalTime.value); // FCFS, SPN에서 사용하는 pArray의 1번째 항목에 AT를 입력
    pArray[index][2] = Number(pBurstTime.value); // FCFS, SPN에서 사용하는 pArray의 2번째 항목에 BT를 입력
    pArray_copy[index][0] = pName.value; // RR에서 사용하는 pArray_copy의 0번재 항목에 이름 입력
    pArray_copy[index][1] = Number(pArrivalTime.value); // RR에서 사용하는 pArray_copy의 1번재 항목에 AT를 입력
    pArray_copy[index][2] = Number(pBurstTime.value); // RR에서 사용하는 pArray_copy의 2번재 항목에 BT를 입력
    index = index + 1; // 인덱스 증가(프로세스 수 증가)
}

// version 1.0때 구현해놓은 해당 함수들은 사용하지 않음 
/*function getPWT() {
    for (var i = 1; i < index; i++) {
        for (var j = 0; j < i; j++) {
            pWaitingTime[i] += Number(pArray[j][2]);
        }
        pWaitingTime[i] -= pArray[i][1];
    }
}
function getPTAT() {
    for (var i = 0; i < index; i++) {
        pTurnAroundTime[i] = Number(pArray[i][2]) + pWaitingTime[i];
    }
}
function getPNTT() {
    for (var i = 0; i < index; i++) {
        pNormalizedTT[i] = pTurnAroundTime[i] / Number(pArray[i][2]);
    }
}*/
function addVisual() { // 프로세서가 프로세스를 처리하는 과정을 출력
    if (z < totalTime) {
        let cell1 = row1.insertCell(z);
        let cell2 = row2.insertCell(z);
        let text1 = document.createTextNode(z + 1);
        let text2 = document.createTextNode(time[z]);
        cell1.appendChild(text1);
        cell2.appendChild(text2);
        z++;
    }
    setPColor(z);
}

function addOutput() { // 최종적으로 모든 프로세스의 정보를 테이블로 출력
    for (var i = 0; i < index; i++) {
        let row = table2.insertRow(i + 1);
        let cell1 = row.insertCell(0);
        let text1 = document.createTextNode(pArray[i][0]);
        let cell2 = row.insertCell(1);
        let text2 = document.createTextNode(pArray[i][1]);
        let cell3 = row.insertCell(2);
        let text3 = document.createTextNode(pArray[i][2]);
        let cell4 = row.insertCell(3);
        let text4 = document.createTextNode(pWaitingTime[i]);
        let cell5 = row.insertCell(4);
        let text5 = document.createTextNode(pTurnAroundTime[i]);
        let cell6 = row.insertCell(5);
        let text6 = document.createTextNode(pNormalizedTT[i].toFixed(1));
        cell1.appendChild(text1);
        cell2.appendChild(text2);
        cell3.appendChild(text3);
        cell4.appendChild(text4);
        cell5.appendChild(text5);
        cell6.appendChild(text6);
    }
}

function setPColor(z) { // 프로세서가 처리하는 프로세서들에 대해서 색을 칠해 구별
    for (let i = 0; i < (z * 2); i++) {
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[0][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "lightpink";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[1][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "lightcoral";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[2][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "skyblue";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[3][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "yellow";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[4][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "paleturquoise";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[5][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "aliceblue";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[6][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "blueviolet";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[7][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "cadetblue";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[8][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "cornflowerblue";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[9][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "brown";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[10][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "chocolate";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[11][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "cyan";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[12][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "darkslategray";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[13][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "hotpink";
        }
        if (table3.getElementsByTagName("td")[i].innerHTML === pArray[14][0]) {
            table3.getElementsByTagName("td")[i].style.backgroundColor = "khaki";
        }
    }
}

function showHiddenTables() { // 프로세서가 프로세스를 처리하는 과정을 서서히 보여주도록 함
    table2.classList.remove("noShowing");
    table3.classList.remove("noShowing");
}

function getSelectedAlgorithm() { // 사용자로부터 radio를 통해 알고리즘을 선택받음 
    const algorithmNodeList = document.getElementsByName("schedulingAlgorithm"); // 모든 알고리즘의 집합
    algorithmNodeList.forEach((node) => { // 모든 알고리즘의 집합에서
        if (node.checked) { // 어떤 노드가 선택되었다면
            selectedAlgorithm = node.value; // 그 노드가 selectedAlgorithm
        }
    })
}

function sortArray() { // 배열을 오름차순으로 정렬
    pArray.sort(function(a, b) {
        return a[1] - b[1];
    });
}

function getTimeQuantum() { // RoundRobin을 이용할 때사용자로부터 TimeQuantum을 입력받음
    timeQuantum = Number(timeQuantumInput.value);
}

function runAlgorithm() { // 선택받을 알고리즘에 따라 해당 알고리즘을 실행시킴
    if (selectedAlgorithm === "fcfs") { // FCFS
        addToQueue();
        getProcessor();
        getOutputTable();
        showHiddenTables();
        addOutput();
        setInterval(addVisual, 300);
    } else if (selectedAlgorithm === "rr") { //RR
        getTimeQuantum();
        addToQueue_rr();
        showHiddenTables();
        getOutputTable();
        addOutput();
        setInterval(addVisual, 300);
    } else if (selectedAlgorithm === "spn") { //SPN
        addToSet_spn();
        getProcess_spn();
        showHiddenTables();
        getOutputTable();
        addOutput();
        setInterval(addVisual, 300);
    }
}

function handleButtonSimulate() { // start 버튼 눌렀을때 실행 되는 함수 (거의 메인 함수)
    getSelectedAlgorithm(); // radio를 통해 알고리즘을 선택함
    sortArray(); // pArray를 정렬하는데 AT를 기준으로 오름 차순으로 정렬
    getTotalTime(); //전체 프로세스의 Burst Time을 추출해서 totalTime 정하기
    runAlgorithm(); // 선택한 알고리즘 실행
}

function handleRR() { // RR에서 사용자로부터 timeQuantum을 입력받을 text를 안보이게 하는 함수
    document.querySelector(".timeQuantum").classList.remove("noShowing");
}

function init() { // 필요한 값들을 초기화하는 함수
    button.addEventListener("click", addRow); // 프로세스 정보 다 입력받고 add 버튼 눌렀을때 addRow 함수 실행
    button_start.addEventListener("click", handleButtonSimulate); // start 버튼 누르면 handleButtonStart 함수 실행
    rr.addEventListener("click", handleRR); // 라운드을 선택하면 TimeQuantum을 입력받음
}

init();