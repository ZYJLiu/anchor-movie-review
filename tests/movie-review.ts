import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js"
import {
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  getAccount,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { MovieReview } from "../target/types/movie_review"
import BN, { min } from "bn.js"
import { TokenMetadataProgram } from "@metaplex-foundation/js"
import { AssetNotFoundError, findMetadataPda } from "@metaplex-foundation/js"
import { token } from "@project-serum/anchor/dist/cjs/utils"

describe("movie-review", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())
  const connection = anchor.getProvider().connection

  const program = anchor.workspace.MovieReview as Program<MovieReview>
  const userWallet = anchor.workspace.MovieReview.provider.wallet

  var mintPDA: PublicKey
  var tokenAddress: PublicKey
  var movieReview: PublicKey
  var movieCommentCounter: PublicKey

  before(async () => {
    ;[mintPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("mint")],
      program.programId
    )

    tokenAddress = await getAssociatedTokenAddress(
      mintPDA,
      userWallet.publicKey
    )
  })

  it("Create Reward Mint", async () => {
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    )

    const metadataPDA = await findMetadataPda(mintPDA)

    const transaction = await program.methods
      .createRewardMint(
        "https://arweave.net/hI558P7p936NjKKoRqvXNePQ-r122ji9BnM9vTTJJ_8",
        "Token Name",
        "SYMBOL"
      )
      .accounts({
        user: userWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        metadata: metadataPDA,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })

    const keys = await transaction.pubkeys()
    // const transactionSignature = await transaction.rpc()

    // console.log(
    //   `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    // )
    // console.log(`https://explorer.solana.com/address/${mintPDA}?cluster=devnet`)
  })

  it("Create Review", async () => {
    const tx = await program.methods
      .addMovieReview("title10", "description", 1)
      .accounts({
        tokenAccount: tokenAddress,
        initializer: userWallet.publicKey,
      })

    const keys = await tx.pubkeys()
    movieReview = keys.movieReview
    movieCommentCounter = keys.movieCommentCounter
    // console.log(keys)

    const transactionSignature = await tx.rpc()
    console.log(
      `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
  })

  it("Update Review", async () => {
    const tx = await program.methods
      .updateMovieReview("title10", "test2", 5)
      .accounts({
        initializer: userWallet.publicKey,
      })

    const keys = await tx.pubkeys()
    // const movieReviewAccount = await program.account.movieAccountState.fetch(
    //   keys.movieReview
    // )
    // console.log(movieReviewAccount.title)

    const transactionSignature = await tx.rpc()
    console.log(
      `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
  })

  it("Add Comment", async () => {
    const tx = await program.methods.addComment("comment").accounts({
      movieReview: movieReview,
      movieCommentCounter: movieCommentCounter,
      tokenAccount: tokenAddress,
      initializer: userWallet.publicKey,
    })

    // const movieCommentAccount2 = await program.account.movieComment.fetch(
    //   movieCommentPda
    // )

    const transactionSignature = await tx.rpc()
    console.log(
      `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
  })

  it("Close", async () => {
    const tx = await program.methods.close().accounts({
      movieReview,
      reviewer: userWallet.publicKey,
    })

    const transactionSignature = await tx.rpc()
    console.log(
      `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
  })
})

// const [movieReviewPda, bump] =
//   await anchor.web3.PublicKey.findProgramAddress(
//     [Buffer.from("title"), userWallet.publicKey.toBuffer()],
//     program.programId
//   )

// const [movieCommentPda, comment_bump] =
//   await anchor.web3.PublicKey.findProgramAddress(
//     [movieReviewPda.toBuffer(), new BN(0).toArrayLike(Buffer, "le", 8)],
//     program.programId
//   )

// const [movieReviewCounterPda, counter_bump] =
//   await anchor.web3.PublicKey.findProgramAddress(
//     [Buffer.from("counter"), movieReviewPda.toBuffer()],
//     program.programId
//   )
