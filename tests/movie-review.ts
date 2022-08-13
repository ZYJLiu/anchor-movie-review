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

  it("Is initialized!", async () => {
    const [movieReviewPda, bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("title"), userWallet.publicKey.toBuffer()],
        program.programId
      )

    const [movieReviewCounterPda, counter_bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("counter"), movieReviewPda.toBuffer()],
        program.programId
      )

    // Add your test here.
    const tx = await program.methods
      .addMovieReview("title", "description", 1)
      .accounts({
        movieReview: movieReviewPda,
        movieCommentCounter: movieReviewCounterPda,
        initializer: userWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const movieReviewAccount = await program.account.movieAccountState.fetch(
      movieReviewPda
    )
    console.log(movieReviewAccount)

    const tx4 = await program.methods
      .updateMovieReview("title", "realloc-realloc", 3)
      .accounts({
        movieReview: movieReviewPda,
        initializer: userWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const movieReviewAccountRealloc =
      await program.account.movieAccountState.fetch(movieReviewPda)
    console.log(movieReviewAccountRealloc)

    const [movieCommentPda, comment_bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [movieReviewPda.toBuffer(), new BN(0).toArrayLike(Buffer, "le", 8)],
        program.programId
      )

    const tx2 = await program.methods
      .addComment("comment1")
      .accounts({
        movieComment: movieCommentPda,
        movieReview: movieReviewPda,
        movieCommentCounter: movieReviewCounterPda,
        initializer: userWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const movieCommentAccount = await program.account.movieComment.fetch(
      movieCommentPda
    )
    console.log(movieCommentAccount)

    const [movieCommentPda2, comment_bump2] =
      await anchor.web3.PublicKey.findProgramAddress(
        [movieReviewPda.toBuffer(), new BN(1).toArrayLike(Buffer, "le", 8)],
        program.programId
      )

    const tx3 = await program.methods
      .addComment("comment2")
      .accounts({
        movieComment: movieCommentPda2,
        movieReview: movieReviewPda,
        movieCommentCounter: movieReviewCounterPda,
        initializer: userWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const movieCommentAccount2 = await program.account.movieComment.fetch(
      movieCommentPda2
    )
    console.log(movieCommentAccount2)

    const tx5 = await program.methods
      .close()
      .accounts({
        movieReview: movieReviewPda,
        reviewer: userWallet.publicKey,
      })
      .rpc()

    console.log(tx5)

    const movieReviewAccount2 = await program.account.movieAccountState.fetch(
      movieReviewPda
    )
    console.log(movieReviewAccount2)
  })
})
