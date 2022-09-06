import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import { Connection, sendAndConfirmTransaction } from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token"
import { MovieReview } from "../target/types/movie_review"
import BN from "bn.js"
import { TokenMetadataProgram } from "@metaplex-foundation/js"
import { AssetNotFoundError, findMetadataPda } from "@metaplex-foundation/js"

describe("movie-review", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())
  const connection = anchor.getProvider().connection

  const program = anchor.workspace.MovieReview as Program<MovieReview>
  const userWallet = anchor.workspace.MovieReview.provider.wallet

  let payer: anchor.web3.Keypair
  it("Is initialized!", async () => {})
})
