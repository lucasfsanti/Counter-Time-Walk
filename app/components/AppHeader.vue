<template>
  <div class="container">
    <div class="header">
      <img src="~/assets/img/Counter_Logo_Original.png" alt="Counter Logo" />
      <h1>Time Walker</h1>
    </div>
  </div>
</template>

<script>
</script>

<style>
.container {
  max-width: 1640px;
  min-height: 100vh;
  margin: 0 auto;

  display: grid;
}
.header {
  display: flex;
  flex-direction: row;
  justify-content: flex-center;
  margin: 1.8125rem 0;
  grid-area: header;
}

.header > img {
  width: auto;
  height: 100px;
}
</style>
