Feature: Wallet Settings

  Background:
    Given I have completed the basic setup

  Scenario: User sets Wallet password
    Given I have the following wallets:
      | name     |
      | Wallet 1 |
      | Wallet 2 |
      | Wallet 3 |
    Then the wallets should be ordered from oldest to newest
