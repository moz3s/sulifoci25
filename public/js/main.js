const kor1 = document.getElementById('kor1');
const kor2 = document.getElementById('kor2');
const nextday = document.getElementById('nextday');
const next = document.getElementById('next');
const other = document.getElementById('other');
const prev = document.getElementById('prev');

window.onload = async () => {
    if (kor1 && kor2) {
        const response = await fetch('https://focikupa.11cipari.hu/api/tabella', {
            method: "GET"
        });
        const res = await response.json();

        for (let i=0; i < res.teams_1.length; i++) {
            let teams = res.teams_1[i];
            let row = document.createElement("tr");
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${teams.osztaly}</td>
                <td>${teams.pontszam}</td>
            `;
            kor1.appendChild(row);
        }
        for (let i=0; i < res.teams_2.length; i++) {
            let teams = res.teams_2[i];
            let row = document.createElement("tr");
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${teams.osztaly}</td>
                <td>${teams.pontszam}</td>
            `;
            kor2.appendChild(row);
        }
    }
    if (next && nextday && other) {
        const response = await fetch('https://focikupa.11cipari.hu/api/meccsek', {
            method: "GET"
        });
        const res = await response.json();
        
        nextday.textContent = res.upcomingMatches[0].date;
        fillTable(res.upcomingMatches, next)
        for (let i = 0; i < res.otherMatches.length; i++) {
            let match = res.otherMatches[i];
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${match.date}</td>
                <td>${match.o1}</td>
                <td>${match.o2}</td>
                <td>${match.time}</td>
            `;
            other.appendChild(row);
        }
        fillTable(res.prevMatches, prev)
    }    
}

function fillTable(matchDB, table) {
    for (let i = 0; i < matchDB.length; i++) {
        let match = matchDB[i];
        if (match.winner == match.o1) {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${match.date}</td>
                <td class="bg-success">${match.o1}</td>
                <td class="bg-danger">${match.o2}</td>
                <td>${match.time}</td>
            `;
            table.appendChild(row);
        } else if (match.winner == match.o2) {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${match.date}</td>
                <td class="bg-danger">${match.o1}</td>
                <td class="bg-success">${match.o2}</td>
                <td>${match.time}</td>
            `;
            table.appendChild(row);
        } else {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${match.date}</td>
                <td>${match.o1}</td>
                <td>${match.o2}</td>
                <td>${match.time}</td>
            `;
            table.appendChild(row);
        }
    }
}