silk = silk.default;

addEventListener("load", () => {
  const app = document.getElementById('app');
  if (!app) {
    console.error("App element not found");
    return;
  }
  const todo = silk('h1', {}, 'Hello Silk!');
  silk(app, null, todo);
});