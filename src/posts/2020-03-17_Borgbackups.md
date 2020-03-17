---
date: 2020-03-17
title: "Borg backups"
subtitle: "Compressed, deduplicated and encrypted backups"
tags: [borg, backups, linux, bash]
layout: post.njk
---

Long overdue a proper backup setup, prompted by a housemate's presentation on the topic, I decided to give Borg a bash.

Until know I've been periodically/sporadically backing up my home folder to an external harddrive with `rsync`:

```
rsync -r -t -v -p -t -E --progress --delete -l -H -s /home/doug/ /run/var/media/harddisk 
```

This is definitely better than copy-pasting, but 1) it is not encrypted, meaning anyone with access to the drive can read my data 2) it takes quite a lot of time 3) it gives only one monolithic backup, meaning I only have the option of reverting to the last backup.

[Borg](https://www.borgbackup.org/), a.k.a. 'Borgbackup' is a _"Deduplicating archiver with compression and encryption"_. It is the de facto successor of [Attic](https://en.wikipedia.org/wiki/Attic_(backup_software)#Borg) since 2015, from which it was forked _"to allow some different approaches to development, goals and policy"_[[ref](https://github.com/borgbackup/borg/issues/1)] From a user perspective, it lets you make **quick, space-efficient, password-protected backups.**

For Debian/Ubuntu users, installing Borg is a simple `sudo apt install borgbackup`. Borg is a command line tool! For those not so keen on The Black Box, there is [Vorta](https://vorta.borgbase.com/) which provides a nice graphical user interface for Borg. However the Vorta team [notes](https://vorta.borgbase.com/usage/) that it _"is currently in beta-testing and shouldn’t be your only backup solution."_ (2020-03-17) which put me off using it for now (although I know at least one person who is happily using it.) There is also [Borgmatic](https://torsion.org/borgmatic/) which essentially allows borg via config files: although this provides some convenience, I couldn't justify the additional complexity for my relatively modest requirements.

So to start with I'm just using plain Borg. There is some very nice [documentation](https://borgbackup.readthedocs.io/en/stable/) and even a couple of [screencasts](https://asciinema.org/~borgbackup). The [Quick start](https://borgbackup.readthedocs.io/en/stable/quickstart.html) is as concise as I can imagine one could be, so I won't repeat that here. Rather I'll just go over a couple things that were of particular interest to me

## Viewing backups via `borg mount`

After always having done unencrypted backups, where I could directly see the results, it's important for me know I can really access the archive contents later. The simplest way to do so seems to be with `borg mount ...`. If you're backing up files which require root access there are some quirks:

Create a temporary mount directory...

```
mkdir /tmp/tempBorgMount
```

Mount the borg archive. Get the names of your archives with `borg list ...`. Use the special `::` to indicate a particular archive...

```
sudo borg mount /path/to/archives::a-particular-archive /tmp/tempBorgMount
```

View files by 1) navigating as root...

```
sudo su
```  
```
cd /tmp/tempBorgMount
```

or 2) opening a file browser with root permission...

```
sudo nemo
```

The last two points threw me a bit, because when I tried to access the mount point with `sudo` I received `sudo: cd: command not found`. `cd` is not available for `sudo`, because if you need root privileges to access a folder, you continue to need it to view it's contents!

## Regular pruning

Pruning, like the horticultural act, is about removing unwanted bits. As time passes, you might be happy to get rid of more backups. `borg prune ...` allows you to do this programmatically. You can specify the number of backups you keep over a time interval with options `--keep-weekly`, `--keep-monthly`, etc. These options specify _the number of copies to keep within that time period_.

For example `borg prune --keep-weekly 2` will remove all of the oldest backups which exceed 2 for a given week. If you made a backup every day for a week, then ran this command, it would prune Monday to Friday and keep just Saturday and Sunday. By combining daily, weekly, monthly and yearly options, you can have a nicely tapering set of backups, ensuring you always have enough space.

## Scriptification

I don't like remembering loads of commands :) Fortunately there is a nice borg script templated in [the docs](https://borgbackup.readthedocs.io/en/stable/quickstart.html#automating-backups) I made some modifications, such as excluding trash and downloads folders from being backed-up. I also didn't include my password: I'll still be 'manually' doing back ups for now, and don't mind entering my password every time.
