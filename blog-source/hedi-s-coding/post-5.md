---
title: Test Code Playground on RSS
date: 2026-04-25
modified: 2026-04-25
---
# Test Code Playground on RSS

let's test if image and the code playground can show in RSS feed
![avatarimage.png|114](https://blog-assets.3chih21.workers.dev/blog/202604/22/avatarimage.png?rDRIbGo7NW)

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