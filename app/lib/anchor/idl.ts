/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blink_tipping.json`.
 */
export type BlinkTipping = {
  "address": "6KMw7CqQMKnUg7RWq1815zNhJXBZU1woEZNDkZ2n7XmK",
  "metadata": {
    "name": "blinkTipping",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeCreator",
      "discriminator": [
        29,
        153,
        44,
        99,
        52,
        172,
        81,
        115
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "creatorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "solVault",
          "docs": [
            "SOL vault - just a system account that will hold SOL"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "usdcMint",
          "docs": [
            "The USDC mint address (devnet: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)"
          ]
        },
        {
          "name": "usdcVault",
          "docs": [
            "USDC vault - token account to hold USDC tips"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  117,
                  115,
                  100,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializePlatformConfig",
      "discriminator": [
        23,
        52,
        237,
        53,
        176,
        235,
        3,
        187
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "sendTip",
      "discriminator": [
        231,
        88,
        56,
        242,
        241,
        6,
        31,
        59
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "creatorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "solVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "usdcVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  117,
                  115,
                  100,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "tipperUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": {
            "defined": {
              "name": "currency"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawTips",
      "discriminator": [
        107,
        192,
        228,
        68,
        165,
        120,
        164,
        23
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "creatorAccount"
          ]
        },
        {
          "name": "creatorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "creatorUsdcAccount",
          "writable": true
        },
        {
          "name": "solVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "usdcVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  117,
                  115,
                  100,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "platformWallet",
          "writable": true
        },
        {
          "name": "platformUsdc",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": {
            "defined": {
              "name": "currency"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "creatorAccount",
      "discriminator": [
        222,
        163,
        32,
        169,
        204,
        8,
        200,
        32
      ]
    },
    {
      "name": "platformConfig",
      "discriminator": [
        160,
        78,
        128,
        0,
        248,
        83,
        230,
        160
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientBalance",
      "msg": "Insufficient balance in vault"
    },
    {
      "code": 6001,
      "name": "invalidFeeBasisPoints",
      "msg": "Invalid fee basis points (must be <= 10000)"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "Unauthorized: Only platform authority can perform this action"
    },
    {
      "code": 6003,
      "name": "invalidCurrency",
      "msg": "Invalid currency type"
    },
    {
      "code": 6004,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "creatorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "docs": [
              "Creator's wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalTipsSol",
            "docs": [
              "Total SOL tips received (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "totalTipsUsdc",
            "docs": [
              "Total USDC tips received (in token amount)"
            ],
            "type": "u64"
          },
          {
            "name": "tipCount",
            "docs": [
              "Number of tips received"
            ],
            "type": "u64"
          },
          {
            "name": "solVaultBump",
            "docs": [
              "SOL vault PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "usdcVaultBump",
            "docs": [
              "USDC vault PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "Creator account PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "currency",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "sol"
          },
          {
            "name": "usdc"
          }
        ]
      }
    },
    {
      "name": "platformConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Platform authority (owner)"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeBasisPoints",
            "docs": [
              "Fee in basis points (25 = 0.25%)"
            ],
            "type": "u16"
          },
          {
            "name": "totalFeesCollectedSol",
            "docs": [
              "Total fees collected in SOL"
            ],
            "type": "u64"
          },
          {
            "name": "totalFeesCollectedUsdc",
            "docs": [
              "Total fees collected in USDC"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Platform config PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
