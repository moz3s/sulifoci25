const kor1 = document.getElementById('kor1');
const kor2 = document.getElementById('kor2');

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
}