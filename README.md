# React Redux WebSocket Patterns

ReduxとReact使ってて、WebSocketで送受信したい時のやり方の案。

### パターン

* WebSocketコンポーネントを作ってそこでWebSocketインスタンスを持つ案
* storeの中にWebSocketインスタンスを入れて使う案

### 試し方



```shell
$ npm install
$ npm run build_componented  # or npm run build_stored
$ npm run serve
```

ブラウザでhttp://localhost:3000 にアクセス。
