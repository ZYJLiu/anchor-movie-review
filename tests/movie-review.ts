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

    const tx = await program.methods
      .addMovieReview("title", "description", 1)
      .accounts({
        movieReview: movieReviewPda,
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

    const movieReviewAccount2 = await program.account.movieAccountState.fetch(
      movieReviewPda
    )
    console.log(movieReviewAccount2)

    const tx5 = await program.methods
      .close()
      .accounts({
        movieReview: movieReviewPda,
        user: userWallet.publicKey,
      })
      .rpc()
  })
})
