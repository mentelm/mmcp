# MMCP Server (Express)
Express-backed MMCP server. 

## Usage

```typescript
import { mmcpServer } from '@mentelm/mmcp-server-express';
import express, { type Express } from 'express';

const mmcp: Express = mmcpServer([
  // your Slice definitions go here
]);

// you can then start MMCP on itself
mmcp.listen(3000);

// or expose it in a subpath of your existing application
const yourApp: Express = express();
yourApp.use('/mcps', mmcp);
yourApp.listen(3000);
```
