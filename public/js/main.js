const csop11 = document.getElementById('csop11');
const csop12 = document.getElementById('csop12');
const csop21 = document.getElementById('csop21');
const csop22 = document.getElementById('csop22');
const nextday = document.getElementById('nextday');
const next = document.getElementById('next');
const other = document.getElementById('other');
const preFinal = document.getElementById('pre-final');
const bronze = document.getElementById('bronze');
const final = document.getElementById('final');
const supercup = document.getElementById('supercup');
const prev = document.getElementById('prev');
const name = document.getElementById('name');
const password = document.getElementById('password');
const o1 = document.getElementById('o1');
const o2 = document.getElementById('o2');
const date = document.getElementById('date');
const time = document.getElementById('time');
const type = document.getElementById('type');
const unDone = document.getElementById('unDone');
const done = document.getElementById('done');

window.onload = async () => {
    if (csop11 && csop12 && csop21 && csop22) {
        console.log('ok');
        const response = await fetch('https://sulifoci25.hu/api/tabella', {
            method: "GET"
        });
        const res = await response.json();

        for (let i=0; i < res.teams_11.length; i++) {
            let teams = res.teams_11[i];
            let row = document.createElement("tr");
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${teams.osztaly}</td>
                <td>${teams.pontszam}</td>
                <td>${teams.golkulonbseg}</td>
            `;
            csop11.appendChild(row);
        }
        for (let i=0; i < res.teams_12.length; i++) {
            let teams = res.teams_12[i];
            let row = document.createElement("tr");
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${teams.osztaly}</td>
                <td>${teams.pontszam}</td>
                <td>${teams.golkulonbseg}</td>
            `;
            csop12.appendChild(row);
        }
        for (let i=0; i < res.teams_21.length; i++) {
            let teams = res.teams_21[i];
            let row = document.createElement("tr");
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${teams.osztaly}</td>
                <td>${teams.pontszam}</td>
                <td>${teams.golkulonbseg}</td>
            `;
            csop21.appendChild(row);
        }
        for (let i=0; i < res.teams_22.length; i++) {
            let teams = res.teams_22[i];
            let row = document.createElement("tr");
            row.innerHTML = `
                <th scope="row">${i+1}</th>
                <td>${teams.osztaly}</td>
                <td>${teams.pontszam}</td>
                <td>${teams.golkulonbseg}</td>
            `;
            csop22.appendChild(row);
        }
    }
    if (preFinal && bronze && final && supercup) {
        const response = await fetch('https://sulifoci25.hu/api/meccsek', {
            method: "GET"
        });
        const res = await response.json();
        
        fillTable(res.preFinalMatches, preFinal);
        fillTable(res.bronzeMatches, bronze);
        fillTable(res.finalMatches, final);
        fillTable(res.SCMatch, supercup);
        fillTable(res.prevMatches, prev);
    }
    if (name && password) {
        password.addEventListener('keypress', function(event) {
            if (event.key == "Enter") {
                loginUser();
            }
        });
        name.focus();
            try {
                const response = await fetch('https://sulifoci25.hu/api/protected-data', {
                    method: "GET",
                    credentials: "include"
                });
                if (response.ok) {
                    location.href = '/admin';
                }
            } catch (error) {
                console.log("Auth check error", error);
            }
    }
    if (o1 && o2 && date && time) {
        try {
            const response = await fetch('https://sulifoci25.hu/api/get-teams', {
                method: "GET"
            });
            const res = await response.json();
            
            fillSelect(o1);
            fillSelect(o2);
            function fillSelect(o) {
                for (let i = 0; i < res.teams.length; i++) {
                    let team = res.teams[i];
                    let option = document.createElement('option');
                    option.setAttribute('value', team.osztaly);
                    option.innerHTML = team.osztaly;
                    o.appendChild(option);
                }
            }
        } catch (err) {
            console.log("Fetch failed", err);
        }
        try {
            const response = await fetch('https://sulifoci25.hu/api/get-match-admin', {
                method: "GET"
            });
            const res = await response.json();

            for (let i = 0; i < res.unDoneMatch.length; i++) {
                let match = res.unDoneMatch[i];
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${match.date}</td>
                    <td><button class="w-25 btn-winner" onclick="selectWinner(${match.id}, 1)">${match.o1}</button></td>
                    <td><button class="w-25 btn-winner" onclick="selectWinner(${match.id}, 2)">${match.o2}</button></td>
                    <td>${match.time}</td>
                    <td><button class="btn btn-danger" onclick="deleteMatch(${match.id})">Törlés</button></td>
                `;
                unDone.appendChild(row);
            }
            for (let i = 0; i < res.doneMatch.length; i++) {
                let match = res.doneMatch[i];
                if (match.winner == match.o1) {
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${match.date}</td>
                        <td class="bg-success">${match.o1}</td>
                        <td class="bg-danger">${match.o2}</td>
                        <td>${match.time}</td>
                        <td><button class="btn btn-warning me-5" onclick="resetMatch(${match.id})">Visszaállítás</button><button class="btn btn-danger" onclick="deleteMatch(${match.id})">Törlés</button></td>

                    `;
                    done.appendChild(row);
                } else if (match.winner == match.o2) {
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${match.date}</td>
                        <td class="bg-danger">${match.o1}</td>
                        <td class="bg-success">${match.o2}</td>
                        <td>${match.time}</td>
                        <td><button class="btn btn-warning me-5" onclick="resetMatch(${match.id})">Visszaállítás</button><button class="btn btn-danger" onclick="deleteMatch(${match.id})">Törlés</button></td>
                    `;
                    done.appendChild(row);
                }
            }
        } catch (err) {
            console.log("Fetch failed", err);
        }
    }
}

async function loginUser() {
    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !password) {
        alert("Minden mezőt tölts ki!");
        return;
    }

    try {
        const response = await fetch('https://sulifoci25.hu/api/login-user', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, password })
        });

        const res = await response.json();

        if (response.ok) {
            location.href = '/admin';
        } else {
            alert(res.error || "Bejelentkezés sikertelen!");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Hálózati hiba! Próbáld újra.");
    }
}

async function logOut() {
    try {
        const response = await fetch('https://sulifoci25.hu/api/logout', {
            method: "POST",
            credentials: "include"
        });
        const res = await response.json();
        console.log(res);

        if (response.ok) {
            location.href = '/';
        } else {
            alert(res.error || "Logout failed! Please try again.");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong! Please try again.");
    }
}

async function addMatch() {
    const isCup = document.getElementById('isCup').checked;
    try {
        const response = await fetch('https://sulifoci25.hu/api/add-match', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                o1: o1.value,
                o2: o2.value,
                date: date.value,
                time: time.value,
                type: type.value,
                isCup
            })
        });
        const res = await response.json();

        if (response.ok) {
            alert(res.message);
            window.location.reload();
        } else {
            alert(res.error)
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

async function deleteMatch(matchId) {
    if (window.confirm("Biztos, hogy törölni akarod ezt a mérkőzést?")) {
        try {
            const response = await fetch('https://sulifoci25.hu/api/delete-match', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchId })
            });
            const res = await response.json();
    
            if (response.ok) {
                alert(res.message);
                window.location.reload();
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error('Error fetching data', err);
        }
    }
}

async function selectWinner(matchId, winner) {
    const bunteto = document.getElementById('bunteto').checked;
    try {
        const response = await fetch('https://sulifoci25.hu/api/select-winner', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchId, winner, bunteto })
        });
        const res = await response.json();

        if (response.ok) {
            alert(res.message);
            window.location.reload();
        } else {
            alert(res.error);
        }
    } catch (err) {
        console.error('Error fetching data', err);
    }
}

async function resetMatch(matchId) {
    if (window.confirm("Biztos, hogy vissza akarod állítani ezt a mérkőzést?")) {
        try {
            const response = await fetch('https://sulifoci25.hu/api/reset-match', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchId })
            });
            const res = await response.json();
    
            if (response.ok) {
                alert(res.message);
                window.location.reload();
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error('Error fetching data', err);
        }
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
