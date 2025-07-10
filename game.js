let turn = 1;
let isGoldenTurnActive = false;
const maxTurn = 40;
let currentTurnPlayer = Math.random() < 0.5 ? 1 : 2;
const players = {
    1: { name: "플레이어 1", hp: 200, defense: false, effects: [], augments: [] },
    2: { name: "플레이어 2", hp: 200, defense: false, effects: [], augments: [] }
};


const augmentPool = [
    { type: '공격형', name: '화염구', desc: '상대에게 즉시 8의 화염 피해를 입힙니다.', apply: (a, t) => dealDamage(a, t, 8) },
    { type: '공격형', name: '관통 타격', desc: '상대의 방어를 무시하고 8의 피해를 입힙니다.', apply: (a, t) => dealDamage(a, t, 8, true) },
    { type: '공격형', name: '전기 충격', desc: '상대에게 5의 피해를 주고 1턴간 혼란 상태로 만듭니다.', apply: (a, t) => { dealDamage(a, t, 5); addEffect(t, { type: '혼란', turns: 1 }); } },
    { type: '공격형', name: '맹타', desc: '상대에게 12의 강력한 피해를 주고, 본인은 1턴간 기절합니다.', apply: (a, t) => { dealDamage(a, t, 12); addEffect(a, { type: '스턴', turns: 1, selfCast: true }); } },
    { type: '공격형', name: '연속 베기', desc: '2턴간 매 턴마다 3의 출혈 피해를 입힙니다.', apply: (a, t) => addEffect(t, { type: '출혈', turns: 2, value: 3 }) },
    { type: '공격형', name: '광폭화', desc: '2턴간 공격력이 5 증가하나, 방어할 수 없습니다.', apply: (a) => addEffect(a, { type: '광폭화', turns: 3, value: 5 }) },
    { type: '공격형', name: '속사', desc: '상대에게 6의 피해를 2회 입힙니다.', apply: (a, t) => { dealDamage(a, t, 6); dealDamage(a, t, 6); } },
    { type: '공격형', name: '기습', desc: '상대에게 6의 피해를 입히고, 다음 턴에 선공합니다.', apply: (a, t) => { dealDamage(a, t, 6); addEffect(a, { type: '선공' }); } },

    { type: '회복형', name: '응급처치', desc: '자신의 HP를 8 회복합니다.', apply: (a) => heal(a, 8) },
    { type: '회복형', name: '재생', desc: '2턴간 매 턴마다 4의 HP를 회복합니다.', apply: (a) => addEffect(a, { type: '재생', turns: 2, value: 20 }) },
    { type: '회복형', name: '치유의 손길', desc: 'HP를 8 회복하고 1턴간 방어합니다.', apply: (a) => { heal(a, 8); players[a].defense = true; } },
    { type: '회복형', name: '포션 폭발', desc: 'HP를 14 회복하지만, 다음 턴 행동할 수 없습니다.', apply: (a) => { heal(a, 24); addEffect(a, { type: '스턴', turns: 1, selfCast: true }); } },

    { type: '방어형', name: '강철 피부', desc: '2턴간 받는 피해를 절반으로 감소시킵니다.', apply: (a) => addEffect(a, { type: '데미지 감소', turns: 2 }) },
    { type: '방어형', name: '철벽 방어', desc: '1턴간 모든 피해를 무효화합니다.', apply: (a) => addEffect(a, { type: '무적', turns: 2 }) },
    { type: '방어형', name: '반격 태세', desc: '1턴간 공격을 받으면 1의 반격 피해를 입힙니다.', apply: (a) => addEffect(a, { type: '카운터', turns: 2 }) },
    { type: '방어형', name: '방패 강화', desc: '3턴간 받는 피해를 매 턴 1씩 고정 감소시킵니다.', apply: (a) => addEffect(a, { type: '고정 감소', turns: 3, value: 1 }) },
    { type: '방어형', name: '후퇴', desc: '2턴간 상대의 공격 성공 확률을 50%로 낮춥니다.', apply: (a) => addEffect(a, { type: '회피', turns: 2 }) },
    { type: '방어형', name: '포스 실드', desc: '3턴간 공격을 받을 때마다 10의 HP를 회복합니다.', apply: (a) => addEffect(a, { type: '포스 실드', turns: 4, value: 10 }) },
    { type: '방어형', name: '마법 방어', desc: '다음 증강을 무효화하는 방어 상태가 됩니다.', apply: (a) => addEffect(a, { type: '증강 무효', turns: 1 }) },

    { type: '상태이상', name: '중독', desc: '2턴간 매 턴마다 2의 중독 피해를 입힙니다.', apply: (a, t) => addEffect(t, { type: '독', turns: 2, value: 2 }) },
    { type: '상태이상', name: '쇠약', desc: '상대의 공격력을 1턴간 1 감소시킵니다.', apply: (a, t) => addEffect(t, { type: '쇠약', turns: 1 }) },
    { type: '상태이상', name: '혼란', desc: '1턴간 50% 확률로 행동 불능 상태로 만듭니다.', apply: (a, t) => addEffect(t, { type: '혼란', turns: 1 }) },
    { type: '상태이상', name: '실명', desc: '1턴간 공격이 50% 확률로 빗나갑니다.', apply: (a, t) => addEffect(t, { type: '실명', turns: 1 }) },
    { type: '상태이상', name: '빙결', desc: '상대를 1턴간 행동 불가 상태로 만듭니다.', apply: (a, t) => addEffect(t, { type: '스턴', turns: 1 }) },

    { type: '특수', name: '행운 상승', desc: '1턴간 증강 성공 확률이 100%가 됩니다.', apply: (a) => addEffect(a, { type: '확정 증강', turns: 2 }) },
    { type: '특수', name: '이속 증가', desc: '다음 턴에 선공합니다.', apply: (a) => addEffect(a, { type: '선공' }) },
    { type: '특수', name: 'HP 도둑', desc: '상대에게 5의 피해를 입히고, 자신은 5의 HP를 회복합니다.', apply: (a, t) => { dealDamage(a, t, 5); heal(a, 5); } },
    {
        type: '특수', name: '역전 찬스', desc: 'HP가 낮을수록 최대 12까지 추가 회복합니다.', apply: (a) => {
            const player = players[a];
            const amount = Math.max(0, Math.floor(12 - player.hp / 10));
            heal(a, amount);
        }
    },
    { type: '특수', name: '희생의 힘', desc: '자신의 HP를 5 감소시키고, 다음 공격에 5의 피해를 추가합니다.', apply: (a) => { dealDamage(a, a, 5); addEffect(a, { type: '추가 공격력', value: 5, turns: 2 }); } },
    { type: '특수', name: '재시도', desc: '증강 실패 시 다시 선택할 수 있습니다.', apply: (a) => addEffect(a, { type: '재시도', turns: 1 }) }
];

const augmentPoolNormal = [...augmentPool];

const augmentPoolStrong = [
    {
        type: '공격형',
        name: '심연의 일격',
        desc: '상대에게 즉시 35의 강력한 피해를 입힙니다.',
        apply: (a, t) => dealDamage(a, t, 35)
    },
    {
        type: '회복형',
        name: '완전 회복',
        desc: 'HP를 150 회복합니다.',
        apply: (a) => heal(a, 150)
    },
    {
        type: '특수',
        name: '체력 스왑',
        desc: '상대와 HP를 맞바꿉니다.',
        apply: (a, t) => {
            const tmp = players[a].hp;
            players[a].hp = players[t].hp;
            players[t].hp = tmp;
            log(`${players[a].name}과 ${players[t].name}의 HP가 뒤바뀌었다!`, 'status');
        }
    },
    {
        type: '특수',
        name: '최후의 일격',
        desc: '상대 HP가 25 이하일 경우 즉시 승리합니다.',
        apply: (a, t) => {
            if (players[t].hp <= 25) {
                players[t].hp = 0;
                log(`${players[a].name}의 최후의 일격! 승리!`, 'golden');
            } else {
                log(`조건이 충족되지 않아 최후의 일격이 실패했습니다.`, 'fail');
            }
        }
    },
    {
        type: '공격형',
        name: '격노의 폭발',
        desc: '상대에게 25 피해, 2턴간 공격력 +5 효과를 얻습니다.',
        apply: (a, t) => {
            dealDamage(a, t, 25);
            addEffect(a, { type: '추가 공격력', value: 5, turns: 2 });
            log(`${players[a].name}가 격노하여 공격력이 증가했습니다!`, 'golden');
        }
    },
    {
        type: '방어형',
        name: '불멸의 방패',
        desc: '3턴간 피해 무효 + HP 10 회복.',
        apply: (a) => {
            addEffect(a, { type: '무적', turns: 4 });
            addEffect(a, { type: '재생', turns: 4, value: 10 });
            log(`${players[a].name}가 불멸의 방패를 펼쳤습니다!`, 'golden');
        }
    },
    {
        type: '공격형',
        name: '파멸의 연격',
        desc: '5의 피해를 4회 연속 입힙니다.',
        apply: (a, t) => {
            for (let i = 0; i < 4; i++) dealDamage(a, t, 5);
        }
    },
    {
        type: '특수',
        name: '분노 전이',
        desc: '자신의 HP를 10 깎고, 상대에게 30 피해.',
        apply: (a, t) => {
            dealDamage(a, a, 10);
            dealDamage(a, t, 30);
        }
    },
    {
        type: '특수',
        name: '운명의 재편',
        desc: '본인의 상태이상 제거, 상대의 방어효과 모두 제거.',
        apply: (a, t) => {
            players[a].effects = players[a].effects.filter(e =>
                !['독', '출혈', '실명', '혼란', '쇠약', '스턴'].includes(e.type));
            players[t].effects = players[t].effects.filter(e =>
                !['defense', '무적', '데미지 감소', '고정 감소', '회피', '포스 실드'].includes(e.type));
            log(`${players[a].name}는 상태이상을 정화하고 ${players[t].name}의 방어를 무너뜨렸습니다!`, "golden");
        }
    },
    {
        type: '회복형',
        name: '피의 계약',
        desc: 'HP를 50 회복하고, 다음 2턴간 받은 피해 50%를 반사합니다.',
        apply: (a) => {
            heal(a, 50);
            addEffect(a, { type: '반사', turns: 3 });
        }
    }
];

function dealDamage(actor, target, dmg, ignoreDef = false) {
    if (hasEffect(target, '무적')) {
        dmg = 0;
    }
    if (!ignoreDef) {
        if (players[target].defense) {
            dmg = 5;
            players[target].defense = false;
            log(`${players[target].name}의 방어 효과가 사라졌습니다!`, "blue");
        }

        if (hasEffect(target, '데미지 감소')) {
            dmg = Math.floor(dmg / 2);
        }

        const flat = players[target].effects.find(e => e.type === '고정 감소');
        if (flat && flat.value) {
            dmg = Math.max(0, dmg - flat.value);
        }
    }
    if (hasEffect(target, '반사')) {
        const hpEl = document.getElementById(`hp${actor}`);
        hpEl.classList.add("damage");
        setTimeout(() => hpEl.classList.remove("damage"), 600);

        players[actor].hp = Math.max(0, players[actor].hp - dmg / 2);
        log(`${players[target].name}의 반사! ${players[actor].name}이(가) ${dmg / 2} 피해를 입었습니다!`, "augment");
        return;
    }

    const hpEl = document.getElementById(`hp${target}`);
    hpEl.classList.add("damage");
    setTimeout(() => hpEl.classList.remove("damage"), 600);

    players[target].hp = Math.max(0, players[target].hp - dmg);
    log(`${players[actor].name} → ${players[target].name}에게 ${dmg} 피해!`, "action");

    const shield = players[target].effects.find(e => e.type === '포스 실드');
    if (shield && shield.value) {
        heal(target, shield.value);
        log(`${players[target].name}의 포스 실드로 ${shield.value} 회복!`, "success");
    }
}

function heal(actor, amount) {
    players[actor].hp = Math.min(200, players[actor].hp + amount);
    log(`${players[actor].name} HP +${amount}`, "success");
}

function addEffect(playerId, effect) {
    if (effect.type === '스턴' && effect.selfCast) {
        effect.turns = Math.max(effect.turns || 1, 2);
    }

    players[playerId].effects.push(effect);

    if (effect.type === '재시도') {
        log(` ${players[playerId].name}에게 '재시도' 효과 부여됨 (${effect.turns}턴)`, "augment");
    } else {
        log(`${players[playerId].name} 에게 '${effect.type}' 효과 부여됨 (${effect.turns}턴)`, "augment");
    }
}

function hasEffect(playerId, type) {
    return players[playerId].effects.some(e => e.type === type);
}

function processEffects(playerId) {
    const effects = players[playerId].effects;
    let logText = '';
    for (let i = effects.length - 1; i >= 0; i--) {
        const e = effects[i];
        if (e.type === '독') {
            players[playerId].hp = Math.max(0, players[playerId].hp - e.value);
            logText += `중독 피해 ${e.value}! `;
        }
        else if (e.type === '재생') {
            players[playerId].hp = Math.min(200, players[playerId].hp + e.value);
            logText += `재생 HP +${e.value}! `;
        }
        else if (e.type === '출혈') {
            players[playerId].hp = Math.max(0, players[playerId].hp - e.value);
            logText += `출혈 피해 ${e.value}! `;
        }
        e.turns--;
        if (e.turns <= 0) effects.splice(i, 1);
    }
    if (logText) log(`${players[playerId].name} 효과 적용: ${logText}`, "blue");
}

function action(type, actor) {
    if (hasEffect(actor, '스턴')) {
        log(`${players[actor].name}는 기절 상태로 행동할 수 없습니다!`, "fail");
        nextTurn();
        return;
    }
    if (actor !== currentTurnPlayer || turn > maxTurn || players[1].hp <= 0 || players[2].hp <= 0) return;
    const target = actor === 1 ? 2 : 1;
    if (type === 'attack' && hasEffect(target, '회피')) {
        if (Math.random() < 0.5) {
            log(`${players[actor].name}의 공격이 상대의 후퇴로 빗나갔습니다!`, "fail");
            nextTurn();
            return;
        }
    }
    const confused = hasEffect(actor, '혼란') && Math.random() < 0.5;
    if (confused) {
        log(`${players[actor].name} 혼란 상태로 행동 실패!`, "fail");
        nextTurn();
        return;
    }
    const panelAttacker = document.getElementById(`panel${actor}`);
    const panelTarget = document.getElementById(`panel${target}`);
    panelAttacker.classList.add(actor === 1 ? 'punch-right' : 'punch-left');
    panelTarget.classList.add('shake');
    setTimeout(() => {
        panelAttacker.classList.remove('punch-right', 'punch-left');
        panelTarget.classList.remove('shake');
    }, 400);
    if (type === 'attack') {
        const miss = hasEffect(actor, '실명') && Math.random() < 0.5;
        if (miss) {
            log(`${players[actor].name} 공격 실패 (실명 효과)`, "fail");
        }
        else {
            let base = hasEffect(actor, '쇠약') ? 5 : 10
            players[actor].effects.forEach(e => {
                if (e.type === '추가 공격력') {
                    base += e.value || 0;
                }
                if (e.type === '광폭화') {
                    base += e.value || 0;
                }
            });;
            dealDamage(actor, target, base);

            const effect = document.createElement('div');
            effect.className = 'hit-effect';
            effect.textContent = '💥';
            panelTarget.appendChild(effect);
            setTimeout(() => panelTarget.removeChild(effect), 500);


            players[actor].effects = players[actor].effects.filter(e => e.type !== '추가 공격력');

            if (hasEffect(target, '카운터')) {
                const effect = document.createElement('div');
                effect.className = 'hit-effect';
                effect.textContent = '💥';
                panelTarget.appendChild(effect);
                setTimeout(() => panelTarget.removeChild(effect), 500);
                dealDamage(target, actor, 1);
                log(`${players[target].name} 반격!`, "action");
            }
        }
    } else if (type === 'defend') {
        if (hasEffect(actor, '광폭화')) {
            log(`${players[actor].name}는 광폭화 상태로 방어할 수 없습니다!`, "fail");
        } else {
            players[actor].defense = true;
            log(`${players[actor].name} 방어 준비!`, "blue");
        }
    } else if (type === 'augment') {
        if (isGoldenTurnActive) {
            showAugments(actor, true);
            isGoldenTurnActive = false;
        } else {
            showAugments(actor);
        }
        return;
    }

    nextTurn();
}

function nextTurn() {
    console.log(`== 턴 ${turn}, 플레이어 ${currentTurnPlayer}의 상태 ==`);
    console.log(players[currentTurnPlayer].effects);
    processEffects(currentTurnPlayer);

    if (hasEffect(currentTurnPlayer, '선공')) {
        players[currentTurnPlayer].effects = players[currentTurnPlayer].effects.filter(e => e.type !== '선공');
    } else {
        currentTurnPlayer = currentTurnPlayer === 1 ? 2 : 1;
        turn++;
    }

    if (goldenTurns.includes(turn)) {
        isGoldenTurnActive = true;
        showGoldenPopup();
    } else {
        isGoldenTurnActive = false;
    }


    document.getElementById("turn-display").textContent = `${Math.min(turn, maxTurn)} / ${maxTurn}`;
    updateButtons();
    updateStatus();
    checkVictory();
}

function showAugments(actor, forceStrong = false) {
    const overlay = document.getElementById("augment-overlay");
    const cards = overlay.querySelectorAll(".card");

    overlay.style.display = "block";
    overlay.classList.remove("fade-out");

    const isPowerTurn = forceStrong || goldenTurns.includes(turn);
    const pool = isPowerTurn ? augmentPoolStrong : augmentPoolNormal;
    const choices = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

    cards.forEach(card => {
        card.classList.remove("selected", "fade-out", "strong");
        card.style.pointerEvents = "auto";
    });

    let alreadySelected = false;

    cards.forEach((card, i) => {
        const aug = choices[i];
        card.querySelector(".augment-type").textContent = aug.type;
        card.querySelector(".augment-name").textContent = aug.name;
        card.querySelector(".augment-desc").textContent = aug.desc;

        if (isPowerTurn) card.classList.add("strong");

        card.onclick = () => {
            if (alreadySelected) return;
            alreadySelected = true;

            updateButtons(false);
            card.classList.add("selected");
            card.style.pointerEvents = "none";

            cards.forEach(other => {
                if (other !== card) {
                    other.classList.add("fade-out");
                    other.style.pointerEvents = "none";
                }
            });

            setTimeout(() => {
                const isRetryCard = aug.name === "재시도";
                const failed = Math.random() > 0.8 && !hasEffect(actor, '확정 증강');

                if (isRetryCard && failed) {
                    log(`${players[actor].name}의 '재시도' 증강이 실패했습니다!`, "fail");
                    log(`재시도 효과 발동! 증강을 다시 선택하세요.`, "augment");

                    overlay.classList.add("fade-out");
                    setTimeout(() => {
                        overlay.style.display = "none";
                        showAugments(actor);
                    }, 800);
                    return;
                }

                if (isRetryCard) {
                    log(`'재시도' 성공! 효과 없음.`, "success");
                    overlay.classList.add("fade-out");
                    setTimeout(() => {
                        overlay.style.display = "none";
                        updateButtons();
                        nextTurn();
                    }, 800);
                    return;
                }

                if (failed && !isPowerTurn) {
                    log(`${players[actor].name}의 증강이 실패했습니다!`, "fail");
                    if (hasEffect(actor, '재시도')) {
                        log("재시도 효과로 다시 선택합니다!", "augment");
                        players[actor].effects = players[actor].effects.filter(e => e.type !== '재시도');

                        overlay.classList.add("fade-out");
                        setTimeout(() => {
                            overlay.style.display = "none";
                            showAugments(actor);
                        }, 800);
                    } else {
                        overlay.classList.add("fade-out");
                        setTimeout(() => {
                            overlay.style.display = "none";
                            updateButtons();
                            nextTurn();
                        }, 800);
                    }
                    return;
                }

                if (hasEffect(actor, '재시도')) {
                    log("증강에 성공하여 재시도 효과가 사라집니다!", "success");
                    players[actor].effects = players[actor].effects.filter(e => e.type !== '재시도');
                }

                const opponent = actor === 1 ? 2 : 1;
                if (hasEffect(opponent, '증강 무효')) {
                    log(`${players[actor].name}의 증강이 ${players[opponent].name}의 마법 방어로 무효화되었습니다.`, "fail");
                    players[opponent].effects = players[opponent].effects.filter(e => e.type !== '증강 무효');

                    overlay.classList.add("fade-out");
                    setTimeout(() => {
                        overlay.style.display = "none";
                        updateButtons();
                        nextTurn();
                    }, 800);
                    return;
                }

                aug.apply(actor, actor === 1 ? 2 : 1);

                overlay.classList.add("fade-out");
                setTimeout(() => {
                    overlay.style.display = "none";
                    updateButtons();
                    updateStatus();
                    nextTurn();
                }, 800);
            }, 1600);
        };
    });
}

function updateStatus() {
    document.getElementById("hp1").textContent = `HP: ${players[1].hp}`;
    document.getElementById("hp2").textContent = `HP: ${players[2].hp}`;
}

function updateButtons(forceEnable = null) {
    [1, 2].forEach(i => {
        const enable = forceEnable !== null ? forceEnable : i === currentTurnPlayer;
        ["attack", "defend", "augment"].forEach(action => {
            document.getElementById(`btn${i}-${action}`).disabled = !enable;
        });
    });
}

function log(msg, type = "action") {
    const logBox = document.getElementById("log");
    const classMap = {
        success: "log-success",
        fail: "log-fail",
        action: "log-action",
        status: "log-status",
        augment: "log-augment",
        golden: "log-golden"
    };

    const className = classMap[type] || "log-action";
    const div = document.createElement("div");
    div.className = `${className} log-entry`;
    div.innerHTML = msg;
    logBox.prepend(div)
    if (logBox.children.length > 50) logBox.removeChild(logBox.lastChild);
}
function checkVictory() {
    if (players[1].hp <= 0 || players[2].hp <= 0 || turn > maxTurn) {
        let result = "무승부!";
        if (players[1].hp > players[2].hp) result = `${players[1].name} 승리!`;
        else if (players[2].hp > players[1].hp) result = `${players[2].name} 승리!`;
        showVictoryScreen(result);
    }
}

function showVictoryScreen(msg) {
    const victoryScreen = document.getElementById("victory-screen");
    const victoryMessage = document.getElementById("victory-message");
    const victoryButton = document.getElementById("victory-button")

    victoryMessage.style.opacity = 0; 
    victoryMessage.textContent = `🏆 ${msg}`;

    victoryScreen.style.display = 'flex';

    setTimeout(() => {
        victoryScreen.style.opacity = 1;
    }, 10);

    setTimeout(() => {
        victoryMessage.style.opacity = 1;
    }, 1010);
    setTimeout(() => {
        victoryButton.style.opacity = 1;
    }, 2020);


    ["btn1-attack", "btn1-defend", "btn1-augment", "btn2-attack", "btn2-defend", "btn2-augment"].forEach(id => {
        document.getElementById(id).disabled = true;
    });
}
let goldenTurns = [];

window.onload = () => {
    const name1 = localStorage.getItem("player1") || "플레이어 1";
    const name2 = localStorage.getItem("player2") || "플레이어 2";
    players[1].name = name1;
    players[2].name = name2;
    document.getElementById("name1").textContent = name1;
    document.getElementById("name2").textContent = name2;
    log(`게임 시작!<br>선공: ${players[currentTurnPlayer].name}`, "action");
    const goldenCount = 3;
    while (goldenTurns.length < goldenCount) {
        let t = Math.floor(Math.random() * maxTurn) + 1;
        if (!goldenTurns.includes(t)) goldenTurns.push(t);
    }
    goldenTurns.sort((a, b) => a - b);
    console.log("황금 증강 팝업 턴들:", goldenTurns);

    updateButtons();
};
function showGoldenPopup() {
    const popup = document.getElementById("golden-popup");
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.opacity = "1";
    }, 10);
    log("황금 증강 턴 시작! 특별한 증강을 선택하세요!", "golden");


    setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => {
            popup.style.display = "none";
        }, 500);
    }, 2000);
}
function onLogbox(){
    const logBox = document.getElementById("log");
    const victoryScreen = document.getElementById("victory-screen");
    const victoryMessage = document.getElementById("victory-message");
    const victoryButton = document.getElementById("victory-button");
    const turndisplay = document.getElementById("turn-display");
    const panel1 = document.getElementById("panel1");
    const panel2 = document.getElementById("panel2");
    const logback = document.getElementById("logBack");

    logback.style.display = "block";
    victoryButton.style.display = "none";
    victoryMessage.style.display = "none";
    victoryScreen.style.display = "none";
    turndisplay.style.display = "none";
    panel1.style.display = "none";
    panel2.style.display = "none";
    logBox.style.display = "block";
}