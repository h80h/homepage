---
title: Code Playground Test, Image Test
date: 2026-02-27
modified: 2026-04-26
---
# Code Playground Test, Image Test

now let me test how the verdana font works when it's a `<p>` element
測試中文 `<li>` type more words to see the position of words between lines

```playground
---html---
<div class="container">
  <p>You're now viewing this example with the <span class='theme-name'>dark</span> theme!</p>
  <button class="theme-toggle">Toggle Theme</button>
</div>
---css---
:root.dark {
  --border-btn: 1px solid rgb(220, 220, 220);
  --color-base-bg: rgb(18, 18, 18);
  --color-base-text: rgb(240, 240, 240);
  --color-btn-bg: rgb(36, 36, 36);
}

:root.light {
  --border-btn: 1px solid rgb(36, 36, 36);
  --color-base-bg: rgb(240, 240, 240);
  --color-base-text: rgb(18, 18, 18);
  --color-btn-bg: rgb(220, 220, 220);
}

body,
.theme-toggle {
  color: var(--color-base-text);
}

body {
  background-color: var(--color-base-bg);
  padding: 10px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

p {
  font-size: 1.5rem;
}

.theme-toggle {
  background-color: var(--color-btn-bg);
  border: var(--border-btn);
  font-size: 1.125rem;
  padding: 10px 20px;
}

.theme-toggle:hover {
  cursor: pointer;
}

.theme-toggle:focus {
  outline: var(--border-btn);
}
---js---
function setTheme() {
  const root = document.documentElement;
  const newTheme = root.className === 'dark' ? 'light' : 'dark';
  root.className = newTheme;
  
  document.querySelector('.theme-name').textContent = newTheme;
}

document.querySelector('.theme-toggle').addEventListener('click', setTheme)
```
## 

```playground
---html---
<div class="container">
  <div class="item first-row">A</div>
  <div class="item first-row">B</div>
  <div class="item first-row last-column">C</div>
  <div class="item">D</div>
  <div class="item">E</div>
  <div class="item last-column">F</div>
  <div class="item">G</div>
  <div class="item">H</div>
  <div class="item last-column">I</div>
</div>
---css---
.container {
  display: grid;
  width: 200px;
  height: 200px;
  background: lightblue;
  justify-content: space-between;
  align-content: space-between;
  grid-template-rows: repeat(3, 50px);
  grid-template-columns: repeat(3, 50px);
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
}

.item {
  background-color: orange;
  border: 1px solid black;
  text-align: center;
}

.first-row {
  /*   background-color: pink; */
}

.last-column {
  /*   background-color: lightblue; */
}

---js---

```

```playground
---html---
<div class="card">
  <h2>Hello!</h2>
  <button onclick="greet()">Click me</button>
</div>
---css---
body {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	margin: 0;
}
.card {
	background: white;
	padding: 2rem;
	border-radius: 12px;
	text-align: center;
}
---js---
function greet() {
	alert('Hey! 👋');
}
```


![avatarimage.png|114](https://blog-assets.3chih21.workers.dev/blog/202604/22/avatarimage.png?rDRIbGo7NW)