# Questions

## solidity

1. what is the keyword `memory` and why is it required when returning an array of struct?

```js
// must return from memory: WHY?
// otherwise: TypeError: Data location must be "memory" or "calldata" for return parameter in function, but none was given.
function paymentsFrom(address account) public view returns (Payment[] memory) {
  return payments[account];
}
```

2. what does the keyword `indexed` mean (what is a "topic" `Stores the parameter as topic`) and when should it be used?

3. when do we have to use [TransactionResponse.wait()](https://docs.ethers.io/v5/single-page/#/v5/api/contract/contract/-%23-contract-functionsSend) in general and in tests?

```js
// no wait
await volcanoCoinContract.connect(ownerAccount).increaseSupply();

// vs waiting
const increaseSupplyTx: ContractTransaction = await volcanoCoinContract
    .connect(ownerAccount)
    .increaseSupply();

// wait for tx to be mined
await increaseSupplyTx.wait();
```

4. is there a cost associated with declaring and calling utility functions? for example is there a difference between writing all logic in a single function body vs breaking it into utility functions that are invoked in the main composer function?

5. is there a cost associated with declaring a local variable for readability?

```js
accounts[msg.sender]
...
payments[msg.sender]

// vs
sender = msg.sender
accounts[sender]
...
payments[sender]
```

## testing

6. what are the best practices for avoiding the code smell of stateful tests? is there a way to clear a contract and redeploy it for each test suite? 