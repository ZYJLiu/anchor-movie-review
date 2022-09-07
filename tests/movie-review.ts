import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token"
import { MovieReview } from "../target/types/movie_review"
import { findMetadataPda } from "@metaplex-foundation/js"
import { expect } from "chai"

describe("movie-review", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())
  const connection = anchor.getProvider().connection

  const program = anchor.workspace.MovieReview as Program<MovieReview>
  const userWallet = anchor.workspace.MovieReview.provider.wallet

  const title = `Title #${Math.random()}`
  const description = "Description"
  const descriptionUpdate = "Update"
  const rating = 1
  const ratingUpdate = 5
  const comment = "comment"

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
        metadata: metadataPDA,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })

    // const keys = await transaction.pubkeys()
    // const transactionSignature = await transaction.rpc()
    // //
    // console.log(
    //   `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    // )

    console.log(`https://explorer.solana.com/address/${mintPDA}?cluster=devnet`)
  })

  it("Create Review", async () => {
    const tx = await program.methods
      .addMovieReview(title, description, rating)
      .accounts({
        tokenAccount: tokenAddress,
        initializer: userWallet.publicKey,
      })

    const keys = await tx.pubkeys()

    movieReview = keys.movieReview
    movieCommentCounter = keys.movieCommentCounter

    const transactionSignature = await tx.rpc()
    console.log(
      `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )

    const movieReviewAccount = await program.account.movieAccountState.fetch(
      keys.movieReview
    )

    expect(movieReviewAccount.title).is.equal(title)
    expect(movieReviewAccount.description).is.equal(description)
    expect(movieReviewAccount.rating).is.equal(rating)
  })

  it("Update Review", async () => {
    const tx = await program.methods
      .updateMovieReview(title, descriptionUpdate, ratingUpdate)
      .accounts({
        initializer: userWallet.publicKey,
      })

    const keys = await tx.pubkeys()

    const transactionSignature = await tx.rpc()
    console.log(
      `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )

    const movieReviewAccount = await program.account.movieAccountState.fetch(
      keys.movieReview
    )

    expect(movieReviewAccount.title).is.equal(title)
    expect(movieReviewAccount.description).is.equal(descriptionUpdate)
    expect(movieReviewAccount.rating).is.equal(ratingUpdate)
  })

  it("Add Comment", async () => {
    const tx = await program.methods.addComment(comment).accounts({
      movieReview: movieReview,
      movieCommentCounter: movieCommentCounter,
      tokenAccount: tokenAddress,
      initializer: userWallet.publicKey,
    })

    const keys = await tx.pubkeys()

    const transactionSignature = await tx.rpc()
    console.log(
      `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )

    const movieCommentAccount = await program.account.movieComment.fetch(
      keys.movieComment
    )
    expect(movieCommentAccount.comment).is.equal(comment)
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
