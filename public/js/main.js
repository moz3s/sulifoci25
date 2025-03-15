const kor1 = document.getElementById('kor1');
const kor2 = document.getElementById('kor2');
const nextday = document.getElementById('nextday');
const next = document.getElementById('next');
const other = document.getElementById('other');

window.onload = async () => {
    if (window.location.pathname.includes('tabella.html')) {
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
    if (window.location.pathname.includes('index.html')) {
        const response = await fetch('https://focikupa.11cipari.hu/api/meccsek');
        const res = await response.json();
        
        nextday.textContent = res.upcomingMatches[0].date;
        for (let i = 0; i < res.upcomingMatches.length; i++) {
            let match = res.upcomingMatches[i];
            let li = document.createElement('li');
            li.textContent = `${match.o1} - ${match.o2} ${match.time}`;
            next.appendChild(li);
        }
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
    }    
}