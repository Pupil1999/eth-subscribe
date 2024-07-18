'use client'
import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { mainnet } from "viem/chains";

export default function Home() {
  const [log, setLog] = useState<any | null>();
  const [blockNumber, setBlockNumber] = useState<number | null>();
  const [blockHash, setBlockHash] = useState<string | null>();

  useEffect(() => {

    const client = createPublicClient({
      chain: mainnet,
      transport: http(`https://mainnet.infura.io/v3/381bfebfafac44e48a185f69401bc416`),
    });

    const getBlockInfo = async () => {
      const block = await client.getBlock({ blockTag: 'latest' });
      setBlockNumber(Number(block.number));
      setBlockHash(block.hash);
    }

    const subscribeEvent = async () => {
      client.watchBlocks({
        onBlock: async(block) => {

          const fromBlock = Number(block.number) - 200;
          const toBlock = Number(block.number) - 100;

          const logs = await client.getLogs({
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
            fromBlock: BigInt(fromBlock),
            toBlock: BigInt(toBlock)
          });

          const logEntry = logs.map(log => {
            const { from, to, value } = log.args;
            return `Block:${log.blockNumber}(hash:${log.blockHash}): transfer from ${from} to ${to} with ${value} USDT\n`
          })

          setBlockNumber(Number(block.number));
          setBlockHash(block.hash);
          setLog(logEntry)
        }
      })
    }

    getBlockInfo();
    subscribeEvent();
  }, [])

  return (
    <main>
      <div>
        The latest block number is : {blockNumber}, hash is {blockHash}.
      </div>
      <div>
        {log}
      </div>
    </main>
  );
}
