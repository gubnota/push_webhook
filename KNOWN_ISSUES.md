```log
[fetch] > HTTP/1.1 POST https://api.sandbox.push.apple.com/3/device/58357e585c22f0fb7edceac009866631db10db3a5726d842f72eead83785280a
[fetch] > apns-push-type: alert
[fetch] > apns-topic: halves
[fetch] > authorization: Bearer eyJ***OIZCYrt1LAxXLb21X_EunnJk0zntfEncuSx0iiW1fBcKjbE8Q
[fetch] > content-type: application/json
[fetch] > Connection: keep-alive
[fetch] > User-Agent: Bun/1.2.0
[fetch] > Accept: */*
[fetch] > Host: api.sandbox.push.apple.com
[fetch] > Accept-Encoding: gzip, deflate, br
[fetch] > Content-Length: 61

error: Malformed_HTTP_Response fetching "https://api.sandbox.push.apple.com/3/device/58357e585c22f0fb7edceac009866631db10db3a5726d842f72eead83785280a". For more information, pass `verbose: true` in the second argument to fetch()
  path: "https://api.sandbox.push.apple.com/3/device/58357e585c22f0fb7edceac009866631db10db3a5726d842f72eead83785280a",
 errno: 0,
  code: "Malformed_HTTP_Response"
```

- Bun.js doesn't support http/2, use node:http2 instead
