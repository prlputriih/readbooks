# Security Specification for PustakaPilihan Firestore Database

## 1. Data Invariants
- A user profile must have a valid `userId` matching the authenticated user's UID.
- A custom book entry can only be created by an authenticated user, setting `createdBy` to their authenticated UID.
- Customized books cannot be edited by someone who did not create them.
- Reading list entries are user-specific and can only be read, created, updated, or deleted by the resource owner.
- A user note must belong to the matching authenticated user.
- Book reviews can only be submitted by authenticated users, with `userId` verified against `request.auth.uid`.

## 2. The "Dirty Dozen" (Malicious Payloads to Block)
1. **Identity Spoofing on User Profile creation**: Modifying another user's profile documents (`users/target_user_id`).
2. **Identity Spoofing on Custom Book creation**: Creating a book under `users/alice/books/book1` with authenticated UID `bob`.
3. **Ghost Fields injection in Custom Book**: Appending un-whitelisted fields (like `isApprovedByAdmin: true` or `flagged: false`) to custom book documents.
4. **Immutability Breach on Custom Book**: Updating the immutable `createdBy` or `id` properties of an existing book.
5. **Denial of Wallet payload sizing**: Attempting to insert a 1MB string into the category of a book.
6. **Reading List poisoning**: Bob creating / updating a reading list entry under Alice's profile (`users/alice/readingList/book1`).
7. **Invalid status values on Reading list status**: Progress status field set to `"complete_super_finished_secret_status"`.
8. **Notes Hijacking**: Bob trying to view or overwrite Alice's private notes at `users/alice/notes/notepad`.
9. **Fake Ratings input limit break**: Creating a review with a rating of `1000` or `-50` (allowed is 1 to 5).
10. **Review Spoofing**: Bob submitting a review under Alice's name or setting `userId = "alice"`.
11. **Review modification lock**: Non-author trying to edit or delete Bob's review at `reviews/review123`.
12. **Blanket Query Scraping**: Requesting all reading list entries of all users without using a secure scope filter.

## 3. Recommended Rules Architecture
All transactions require authenticated users, type validations, and proper path variable bounds matching the owner UID.
The final firestore.rules will block all these attacks.
