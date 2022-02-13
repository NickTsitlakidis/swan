import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter/material.dart';

import '../Models/wallet_info.dart';
import '../Utils/wallets/phantom.dart';
import '../Utils/wallets/solflare.dart';
import '../Widgets/wallet_card.dart';

class HomePage extends HookConsumerWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    selectWallet(dynamic title) {
      if (title == null) {
        return;
      }
      if (title == 'Solflare') {
        ref.read(solflareWallet.notifier).connectWallet();
      } else {
        ref.read(phantomWallet.notifier).connectWallet();
      }
    }

    final _supportedWallets = [
      Walletinfo(
          title: 'Phantom',
          image: 'assets/images/phantom.png',
          installedTitle: ref.watch(hasPhantom)
              ? 'Connect to Phantom'
              : 'Please install Phantom',
          installed: ref.watch(hasPhantom)),
      Walletinfo(
          title: 'Solflare',
          image: 'assets/images/solflare.jpg',
          installedTitle: ref.watch(hasSolflare)
              ? 'Connect to Solflare'
              : 'Please install Solflare',
          installed: ref.watch(hasSolflare))
    ];

    final _cards = _supportedWallets
        .map((wallet) => WalletCard(
              title: wallet.title,
              image: wallet.image,
              installedTitle: wallet.installedTitle,
              installed: wallet.installed,
              selectWallet: selectWallet,
            ))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('NFT Game'),
      ),
      body: Container(
        alignment: Alignment.center,
        child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: _cards),
      ),
    );
  }
}
