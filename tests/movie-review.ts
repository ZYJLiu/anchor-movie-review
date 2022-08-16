import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import { Connection, sendAndConfirmTransaction } from "@solana/web3.js"
import { MovieReview } from "../target/types/movie_review"
import BN from "bn.js"

describe("movie-review", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.MovieReview as Program<MovieReview>
  const userWallet = anchor.workspace.MovieReview.provider.wallet

  it("Test", async () => {

  })
})
